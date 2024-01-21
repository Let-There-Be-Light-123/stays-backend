<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\Verification;
use App\Mail\ForgetPassword;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmailController extends Controller
{
    public function sendVerificationEmail(Request $request)
    {
        $userEmail = $request->input('email');
        $token = $request->input('token');  
        try {
            Mail::to($userEmail)->send(new Verification($token));
            Log::info('Verification email sent successfully', ['user_email' => $userEmail]);
            return response()->json(['message' => 'Verification email sent successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error sending verification email', ['user_email' => $userEmail, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error sending verification email'], 500);
        }
    }

    public function sendTemporaryPassword(Request $request)
    {
        $email = $request->input('email');
        $tempPassword = $this->generateRandomPassword();

        try {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->password = Hash::make($tempPassword);
                $user->save();
                Mail::to($email)->send(new ForgetPassword($tempPassword));
                Log::info('Temporary password sent successfully', ['user_email' => $email]);
                return response()->json(['message' => 'Temporary password sent successfully'], 200);
            } else {
                Log::error('User not found', ['user_email' => $email]);
                return response()->json(['message' => 'User not found'], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error sending temporary password', ['user_email' => $email, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error sending temporary password'], 500);
        }
    }

    private function generateRandomPassword($length = 8)
    {
        return Str::random($length);
    }
}
