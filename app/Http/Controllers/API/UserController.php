<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Auth;
use Validator;
use Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\File;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\NotificationController;


class UserController extends Controller
{

    private $domain = "lkseqc.mailer91.com";
    private $authKey = "411573Aa1y6QKQsl657759ffP1";
    private $templateId = "global_otp";
    protected $notificationController;
    public function __construct( NotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }
    /**
     * Display a listing of the resource.
     */
    public function getAllUsers()
    {
        try {
            $users = User::with('role')->get();
            $userDetails = $users->map(function ($user) {
                return [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'social_security' => $user->social_security,
                    'is_verified'=>$user->is_verified,
                    'role_id' => $user->role_id,
                ];
            });
            return response()->json(['users' => $userDetails]);
        } catch (\Exception $e) {
            Log::error('Error fetching users: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching users.'], 500);
        }
    }

    public function deleteUser(Request $request): Response
    {
        try {
            $socialSecurities = $request->input('social_securities', []);
    
            if (empty($socialSecurities)) {
                return response(['error' => 'No social securities provided.'], 400);
            }
            $deletedUsers = [];
            foreach ($socialSecurities as $socialSecurity) {
                // Find the user or skip to the next one
                $user = User::where('social_security', $socialSecurity)->first();
                if ($user) {
                    $user->delete();
                    $deletedUsers[] = $socialSecurity;
                }
            }
    
            return response(['message' => 'Users deleted successfully', 'deleted_users' => $deletedUsers], 200);
        } catch (\Exception $e) {
            // Log any errors that occur during the deletion
            Log::error('Error deleting users: ' . $e->getMessage());
    
            // Return an error response
            return response(['error' => 'An error occurred while deleting the users.'], 500);
        }
    }
    public function updateAppUserDetails(Request $request, $social_security): Response
    {
        $requestData = $request->validate([
            'phone' => 'nullable|numeric',
            'role_id' => 'nullable|exists:roles,role_id',
            'is_verified' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            // Add other fields as needed
        ]);

        try {
            // Find the user or throw an exception
            $user = User::where('social_security', $social_security)->firstOrFail();
        } catch (ModelNotFoundException $e) {
            return Response(['message' => 'User not found'], 404);
        }

        // Update user details
        $user->update($requestData);
        $this->notificationController->sendNotificationToUser(new Request([
            'userId' => $social_security,
            'title' => 'Booking Status Changed',
            'body' => "Your profile verification status has been changed to " . ($user->is_verified ? 'Verified' : 'Not Verified'),
        ]));
        return Response(['message' => 'User details updated successfully'], 200);
    }
    public function loginUser(Request $request): Response
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required', 
            'password' => 'required',
        ]);
    
        if ($validator->fails()) {
            return Response(['message' => $validator->errors()], 401);
        }
        
        $identifier = $request->input('identifier');
        $password = $request->input('password');
    
        $countryCode = '+1'; 
        $phoneNumber = $identifier;
    
        if (preg_match('/^\+(\d{1,4})(\d+)$/', $identifier, $matches)) {
            $countryCode = $matches[1];
            $phoneNumber = $matches[2];
        }
    
        if (filter_var($phoneNumber, FILTER_VALIDATE_EMAIL)) {
            $loginField = 'email';
        } elseif (preg_match('/^\d{9}$/', $phoneNumber)) {
            $loginField = 'social_security';
        } elseif (preg_match('/^\d{10}$/', $phoneNumber)) {
            Log:info($phoneNumber);
            $loginField = 'phone';
        } else {
            Log::warning('Invalid identifier format: ' . $identifier);
            return Response(['message' => 'Invalid identifier format'], 401);
        }
    
        $credentials = [
            $loginField => $phoneNumber,
            'password' => $password,
        ];
    
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $success = $user->createToken('Login Token')->plainTextToken;
            return Response(['token' => $success], 200);
        }
    
        return Response(['message' => 'Invalid credentials'], 401);
    }

    public function register(Request $request): Response
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'identifier' => 'required',
            'social_security' => 'required|numeric|unique:users,social_security',
            'password' => 'required|min:8',
            'role_id' => 'sometimes|string',
            'address' => 'sometimes|string',
            'is_homeless' => 'sometimes|boolean',
        ]);
    
    
        if ($validator->fails()) {
            Log::error('Validation failed during user registration. Please Enter Correct Details.');
            return response(['message' => $validator->errors()], 422);
        }
    
        $identifier = $request->input('identifier');
        $password = $request->input('password');
        $phoneNumber = $identifier;
    
        if (filter_var($phoneNumber, FILTER_VALIDATE_EMAIL)) {
            $loginField = 'email';
        } elseif (preg_match('/^\d{10}$/', $phoneNumber)) {
            $loginField = 'phone';
        } else {
            Log::warning('Invalid identifier format: ' . $identifier);
            return response(['message' => 'Invalid identifier format'], 401);
        }
    
        $defaultRoleId = 'appuser';
        $defaultIsVerified = false;
        $defaultIsActive = false;
        // Check if the user with the given social_security exists
        $existingUser = User::where('social_security', $request->input('social_security'))->first();
    
        if ($existingUser) {
            // User already exists
            if ($existingUser->role_id === 'guest') {
                // If the user has role_id as 'guest', update to 'appuser'
                $existingUser->update(['role_id' => 'appuser']);
                return response(['message' => 'User role updated successfully'], 201);
            } else {
                // If the user has a different role_id, return an error
                Log::error('User with the same social_security already exists with role_id: ' . $existingUser->role_id);
                return response(['message' => 'User with the same social_security already exists with a different role_id'], 409);
            }
        }
    
        try {
            $userData = [
                'name' => $request->input('name'),
                'password' => Hash::make($password),
                'role_id' => $defaultRoleId,
                'is_verified' => $defaultIsVerified,
                'is_active' => $defaultIsActive,
                'is_homeless' => $request->input('is_homeless'),
                'social_security' => $request->input('social_security'),
            ];
    
            $userData[$loginField] = $identifier;
    
            $user = User::create($userData);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    
    
        return response(['message' => 'User registered successfully'], 201);
    }

    public function registeredByAdmin(Request $request): Response
    {
        $adminRoles = ['admin', 'superadmin'];
        $loggedInUserRole = auth()->user()->role_id;
        if (!in_array($loggedInUserRole, $adminRoles)) {
            Log::error('Unauthorized access: Only admins and superadmins can create users.');
            return response(['message' => 'Unauthorized access'], 403);
        }


        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'social_security' => 'required|numeric|unique:users,social_security',
            'role_id' => 'required|string|in:admin,superadmin',
            'address' => 'sometimes|string',
            'photo' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed during user registration by admin');
            return response(['message' => $validator->errors()], 422);
        }
        $defaultIsVerified = true;
        $defaultIsActive = true;
        try {
            $defaultPassword = 'defaultpassword';
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'social_security' => $request->input('social_security'),
                'password' => Hash::make($defaultPassword),
                'role_id' => $request->input('role_id'),
                'is_verified' => $defaultIsVerified,
                'is_active' => $defaultIsActive,
            ]);
            if ($request->has('photo')) {
                $base64Image = $request->input('photo');
                $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
                $imageName = Str::random(10) . '.png';
                $imagePath = 'uploads/' . $user->id . '/file/' . $imageName;

                Storage::disk('public')->put($imagePath, $imageData);

                $file = File::create([
                    'user_id' => $user->id,
                    'filepath' => $imagePath,
                    'filetype' => 'image/png',
                    'filename' => $imageName,
                ]);

                $user->files()->save($file);
            }

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            dd($e->getMessage());
        }

        return response(['message' => 'User created successfully by admin'], 201);
    }
    public function updateSelfDetails(Request $request): Response
    {
        Log::info('Updating user details for self');
        $user = Auth::user();
        if (!$user) {
            Log::warning('User not authenticated');
            return response(['message' => 'User not authenticated'], 401);
        }
    
        $requestData = $request->validate([
            'phone' => 'nullable|numeric',
            'role_id' => 'nullable|exists:roles,role_id',
            'is_verified' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'address' =>'sometimes|string'
            // 'password' => 'nullable|min:8',
            // 'address_id' => 'nullable|exists:addresses,address_id',
        ]);
    
    
        $user->fill($requestData);
        $user->save();
    
    
        return response(['message' => 'User details updated successfully'], 200);
    }
    public function updateUserDetails(Request $request): Response
    {
        $authUser = Auth::user();
        if (!$authUser->hasRole('Admin') || !$authUser->hasRole('Superadmin')) {

            return Response(['message' => 'Unauthorized', 'role_id' => $authUser->role->role_id], 401);
        }
        $requestData = $request->validate([
            'social_security' => 'required|numeric',
            'phone' => 'required|string',
            'role_id' => 'required|numeric|exists:roles,id', // Validate that the role_id exists in the roles table
            'is_verified' => 'required|boolean',
            'is_active' => 'required|boolean',
            'address'=> 'sometimes|string'
        ]);

        try {
            $user = User::where('social_security', $requestData['social_security'])->firstOrFail();
        } catch (ModelNotFoundException $e) {
            return Response(['message' => 'User not found'], 404);
        }

        // Update user details
        $user->update($requestData);

        return Response(['message' => 'User details updated successfully'], 200);
    }

    public function sendEmailWithOTP($email, $name)
    {
        $otp = $this->generateOTP();
        $this->saveOTP($email, $otp);
        $recipients = [
            "to" => [
                [
                    "email" => $email,
                    "name" => $name,
                ],
            ],
        ];
        $data = [
            "recipients" => [$recipients],
            "from" => [
                "email" => "no-reply@{$this->domain}",
            ],
            "domain" => $this->domain,
            "template_id" => $this->templateId,
            "company_name" => "ADU",
         ];
        $url = "https://control.msg91.com/api/v5/email/send";
        $headers = [
            "authkey: {$this->authKey}",
            "Content-Type: application/json",
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode == 200) {
            echo "Email sent successfully.\n";
            echo $response;
        } else {
            echo "Failed to send email. Status code: $httpCode\n";
            echo $response;
        }

        curl_close($ch);
    }

    public function verifyOTP(Request $request): Response
    {
        $email = $request->input('email');
        $enteredOTP = $request->input('otp');
        $savedOTP = $this->getSavedOTP($email);
        if (!$savedOTP) {
            return response(['message' => 'OTP not found for the user'], 404);
        }
        if ($enteredOTP == $savedOTP) {
            $this->clearSavedOTP($email);
            return response(['message' => 'OTP verified successfully'], 200);
        }
        return response(['message' => 'Invalid OTP'], 422);
    }

    private function generateOTP()
    {
        return rand(1000, 9999);
    }

    private function saveOTP($email, $otp)
    {
        echo "OTP for $email: $otp\n";
    }

    public function verifyEmail(Request $request, $id, $hash): Response
    {
        $user = User::find($id);

        if (!$user || !Hash::check($user->getEmailForVerification(), $hash)) {
            throw ValidationException::withMessages([
                'message' => 'Invalid verification link',
            ]);
        }

        $user->markEmailAsVerified();

        return response(['message' => 'Email verified successfully'], 200);
    }

    private function sendEmail(array $recipients, array $from, string $domain, array $replyTo, string $templateId)
    {
        $options = [
            'headers' => [
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'authkey' => $this->authKey,
            ],
            'json' => [
                'recipients' => $recipients,
                'from' => $from,
                'domain' => $domain,
                'reply_to' => $replyTo,
                // 'attachments' => $attachments,
                'template_id' => $templateId,
            ],
        ];

        $response = Http::secure()->post('https://control.msg91.com/api/v5/email/send', $options);

        // Access the response as needed
        $responseData = $response->json();
        return $responseData;
    }

    public function sendCustomEmail(Request $request)
    {
        try {
            $request->validate([
                'recipients' => 'required|array',
                'from' => 'required|array',
                'domain' => 'required|string',
                'reply_to' => 'array',
                'attachments' => 'array',
                'template_id' => 'required|string',
            ]);
    
            $recipients = $request->input('recipients', []);
            $from = $request->input('from', []);
            $domain = $request->input('domain');
            $replyTo = $request->input('reply_to', []);
            $attachments = $request->input('attachments', []);
            $templateId = $request->input('template_id');
    
            // Log::info('Custom email request received', [
            //     'recipients' => $recipients,
            //     'from' => $from,
            //     'domain' => $domain,
            //     'reply_to' => $replyTo,
            //     'attachments' => $attachments,
            //     'template_id' => $templateId,
            // ]);
    
            $result = $this->sendEmail($recipients, $from, $domain, $replyTo, $templateId);
    
    
            return response(['result' => $result], 200);
        } catch (\Exception $e) {
            Log::error('Error sending custom email: ' . $e->getMessage());
            return response(['error' => 'An error occurred while sending custom email.'], 500);
        }
    }
    public function forgotPassword(Request $request): Response
    {
        $request->validate(['email' => 'required|email']);
        $newPassword = $this->generateRandomPassword();
        $user = User::where('email', $request->input('email'))->first();
        if (!$user) {
            return response(['message' => 'User not found'], 404);
        }
        $user->update(['password' => bcrypt($newPassword)]);
        $this->sendPasswordEmail($user->email, $newPassword);
        $userVariable = $user->name;
        return response(['message' => 'New password sent to your email'], 200);
    }
    private function generateRandomPassword($length = 8)
    {
        return Str::random($length);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function userDetails(Request $request): Response
    {
        $user = $request->user();

        if (Auth::check()) {
            $user = Auth::user();
            return Response(['data' => $user], 200);
        }
        return Response(['data' => 'Unauthorized'], 401);
    }
    public function getUserDetails(): Response
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('User not authenticated');
                return response(['message' => 'User not authenticated'], 401);
            }
            $files = $user->files;



            $fileDetails = $files->map(function ($file) {
                return [
                    'filename' => $file->filename,
                    'filepath' => $file->filepath,
                    'filetype' => $file->filetype,
                    'social_security' => $file->social_security,
                    'id' => $file->id,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at
                ];
            });
            return response([
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'social_security' => $user->social_security,
                    'is_verified' => $user->is_verified,
                    'role_id' => $user->role_id,
                ],
                'files' => $fileDetails,
            ], 200);
    
        } catch (\Exception $e) {
            Log::error('Error fetching user details: ' . $e->getMessage());
            return response(['error' => 'An error occurred while fetching user details.'], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function logout(Request $request): Response
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return Response(['data' => 'User Logout successfully.'], 200);
    }
    public function assignUserPermission(Request $request, $social_security): Response
    {
        $user = User::find($social_security);

        if (!$user) {
            return Response(['message' => 'User not found'], 404);
        }

        $permissionId = $request->input('permission_id');
        $user->assignPermission($permissionId);

        return Response(['message' => 'Permission assigned successfully'], 200);
    }

    public function revokeUserPermission(Request $request, $social_security): Response
    {
        $user = User::find($social_security);

        if (!$user) {
            return Response(['message' => 'User not found'], 404);
        }

        $permissionId = $request->input('permission_id');
        $user->revokePermission($permissionId);

        return Response(['message' => 'Permission revoked successfully'], 200);
    }

    public function syncUserPermissions(Request $request, $social_security): Response
    {
        $user = User::find($social_security);

        if (!$user) {
            return Response(['message' => 'User not found'], 404);
        }

        $permissionIds = $request->input('permission_ids', []);
        $user->syncPermissions($permissionIds);

        return Response(['message' => 'Permissions synced successfully'], 200);
    }
    public function getUserRole(Request $request): Response
    {
        $authUser = Auth::user();
        $authUserRole = $authUser->roleName();
        if (!($authUserRole === "Superadmin" || $authUserRole === "Admin")) {
            return Response(['message' => 'Unauthorized'], 401);
        }

        $requestData = $request->validate([
            'email' => 'nullable|email',
            'social_security' => 'nullable|numeric|exists:users,social_security',
        ]);
        $user = null;
        if (array_key_exists('email', $requestData)) {
            $user = $this->findUserByEmail($requestData['email']);
        } elseif (array_key_exists('social_security', $requestData)) {
            $user = $this->findUserBySocialSecurity($requestData['social_security']);
        }

        if (!$user) {
            return response(['message' => 'User not found'], 404);
        }
        $role = $user->roleName();
        return response(['role' => $role], 200);
    }
    public function assignUserRole(Request $request): Response
    {
        $authUser = Auth::user();
        $authUserRole = $authUser->roleName();

        if (!($authUserRole === "Superadmin" || $authUserRole === "Admin")) {
            return Response(['message' => 'Unauthorized'], 401);
        }

        $requestData = $request->validate([
            'email' => 'nullable|email',
            'social_security' => 'nullable|numeric|exists:users,social_security',
            'role_id' => 'required|exists:roles,role_id', // Validate that role_id exists in roles table
        ]);

        $user = null;

        if (array_key_exists('email', $requestData)) {
            $user = $this->findUserByEmail($requestData['email']);
        } elseif (array_key_exists('social_security', $requestData)) {
            $user = $this->findUserBySocialSecurity($requestData['social_security']);
        }

        if (!$user) {
            return Response(['message' => 'User not found'], 404);
        }

        $this->assignRoleToUser($user, $requestData['role_id']);

        return Response(['message' => 'Role assigned successfully'], 200);
    }
    private function findUser($identifier)
    {
        $query = User::query();
        if (is_numeric($identifier)) {
            $query->where('social_security', $identifier);
        } else {
            $query->where('name', $identifier);
        }
        $user = $query->first();
        return $user;
    }

    private function assignRoleToUser($user, $roleId)
    {
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }
        $user->update(['role_id' => $roleId]);
        return true;
    }

    private function updateUserRoles($user, $roleName)
    {
        $user->syncRoles([$roleName]);
        return true;
    }
    public function assignPermission(Request $request): Response
    {
        $user = Auth::user();

        $user_id = $request->input('user_id');
        $permission_ids = $request->input('permission_ids');

        // Check if user and permissions exist
        $user = User::find($user_id);
        if (!$user) {
            return response(['message' => 'User not found'], 404);
        }

        $permissions = Permission::whereIn('permission_id', $permission_ids)->get();
        if ($permissions->count() !== count($permission_ids)) {
            return response(['message' => 'Invalid permission(s) provided'], 422);
        }

        // Assign permissions to the user
        $user->permissions()->sync($permissions);

        return response(['message' => 'Permissions assigned successfully'], 200);
    }

    public function revokePermission(Request $request): Response
    {
        $user = Auth::user();

        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
        ]);

        $permissionId = $request->input('permission_id');

        $user->permissions()->where('permission_id', $permissionId)->delete();

        return response(['message' => 'Permission revoked successfully'], 200);
    }

    public function getUserPermissions(): Response
    {
        $user = Auth::user();

        $permissions = $user->permissions;

        return response(['permissions' => $permissions], 200);
    }


    private function findUserByEmail($email)
    {
        return User::where('email', $email)->first();
    }

    private function findUserBySocialSecurity($socialSecurity)
    {
        return User::where('social_security', $socialSecurity)->first();
    }

    public function getFavoriteProperties($userId)
    {

        try {
            $user = User::find($userId);
    
            if (!$user) {
                Log::error('User not found for user ID: ' . $userId);
                return response()->json(['error' => 'User not found'], 404);
            }
    
            $favoriteProperties = $user->getFavoriteProperties();
    
    
            return response()->json(['favorite_properties' => $favoriteProperties]);
        } catch (\Exception $e) {
            Log::error('Error in getFavoriteProperties: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
    
    public function addFavoriteProperty(Request $request)
    {
        try {

            $userId = $request->input('social_security');
            $propertyId = $request->input('property_id');
            $user = User::find($userId);
            
    
            if (!$user) {
                Log::error('User not found for user ID: ' . $userId);
                return response()->json(['error' => 'User not found'], 404);
            }
    
            $property = Property::find($propertyId);
    
            if (!$property) {
                Log::error('Property not found for property ID: ' . $propertyId);
                return response()->json(['error' => 'Property not found'], 404);
            }
    
            $user->favoriteProperties()->attach($property);
    
    
            return response()->json(['message' => 'Property added to favorites']);
        } catch (\Exception $e) {
            Log::error('Error in addFavoriteProperty: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function removeFavoriteProperty(Request $request)
    {
        try {
            $userId = $request->input('social_security');
            $propertyId = $request->input('property_id');
            $user = User::find($userId);

            if (!$user) {
                Log::error('User not found for user ID: ' . $userId);
                return response()->json(['error' => 'User not found'], 404);
            }

            $property = Property::find($propertyId);

            if (!$property) {
                Log::error('Property not found for property ID: ' . $propertyId);
                return response()->json(['error' => 'Property not found'], 404);
            }

            $user->favoriteProperties()->detach($property);


            return response()->json(['message' => 'Property removed from favorites']);
        } catch (\Exception $e) {
            Log::error('Error in removeFavoriteProperty: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function searchUsers(Request $request)
    {
        $query = $request->input('query');

        try {
            $users = User::where('email', 'like', "%$query%")
                ->orWhere('social_security', 'like', "%$query%")
                ->orWhere('name', 'like', "%$query%")
                ->orWhere('phone', 'like', "%$query%")
                ->get();
            // Map user details
            $userDetails = $users->map(function ($user) {
                return [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'social_security' => $user->social_security,
                    'is_verified' => $user->is_verified,
                    'role_id' => $user->role_id,
                ];
            });
            // Log the successful completion of the search
            return response()->json(['users' => $userDetails]);
        } catch (\Exception $e) {
            // Log any errors that occur during the search
            Log::error('Error searching users: ' . $e->getMessage());
            // Return an error response
            return response()->json(['error' => 'An error occurred while searching users.'], 500);
        }
    }

    public function storeFCMToken(Request $request)
    {
        try {
            $user = Auth::user();
            $fcmToken = $request->input('remember_token');
            if ($user) {
                if ($user->remember_token !== null) {
                    $user->update(['remember_token' => $fcmToken]);
                } else {
                    $user->remember_token = $fcmToken;
                    $user->save();
                }
                return response()->json(['message' => 'FCM token stored successfully.']);
            } else {
                Log::error('User not authenticated.');
                return response()->json(['error' => 'User not authenticated.'], 401);
            }
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while processing the request.'], 500);
        }
    }
}