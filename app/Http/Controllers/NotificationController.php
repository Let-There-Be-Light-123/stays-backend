<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{

    public function __construct()
    {
    }

    public function sendWebNotificationToAll(Request $request)
    {
        try {
            $url = 'https://fcm.googleapis.com/fcm/send';
            $FcmToken = User::whereNotNull('remember_token')
            ->where('remember_token', '!=', '')
            ->pluck('remember_token')
            ->all();            
            $serverKey = env('FIREBASE_SERVER_KEY');
            
            Log::info('FCM Tokens to send the notification: ' . json_encode($FcmToken));

            $data = [
                "registration_ids" => $FcmToken,
                "notification" => [
                    "title" => $request->title,
                    "body" => $request->body,
                    "image" => $request->image_url,
                ]
            ];
            $encodedData = json_encode($data);

            $headers = [
                'Authorization:key=' . $serverKey,
                'Content-Type: application/json',
            ];

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
            // Disabling SSL Certificate support temporarily
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedData);
            // Execute post
            $result = curl_exec($ch);

            if ($result === FALSE) {
                Log::error('Curl failed: ' . curl_error($ch));
                die('Curl failed: ' . curl_error($ch));
            }

            curl_close($ch);

            Log::info('Notification sent to all users successfully.');
            dd($result);
        } catch (\Exception $e) {
            Log::error('Error sending notification to all users: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function sendNotificationToUser(Request $request)
    {
        try {
            // Get the user by ID
            $user = User::find($request->userId);

            if (!$user) {
                Log::warning('User not found with ID: ' . $request->userId);
                return response()->json(['error' => 'User not found.'], 404);
            }

            $url = 'https://fcm.googleapis.com/fcm/send';
            $deviceToken = $user->remember_token;
            $serverKey = env('FIREBASE_SERVER_KEY');

            $data = [
                "to" => $deviceToken,
                "notification" => [
                    "title" => $request->title,
                    "body" => $request->body,
                ]
            ];
            $encodedData = json_encode($data);

            $headers = [
                'Authorization:key=' . $serverKey,
                'Content-Type: application/json',
            ];

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
            // Disabling SSL Certificate support temporarily
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedData);

            // Execute post
            $result = curl_exec($ch);

            if ($result === FALSE) {
                Log::error('Curl failed: ' . curl_error($ch));
                die('Curl failed: ' . curl_error($ch));
            }

            curl_close($ch);

            Log::info('Notification sent to user ' . $request->userId . ' successfully.');
            return response()->json(['message' => 'Notification sent successfully.']);
        } catch (\Exception $e) {
            Log::error('Error sending notification to user ' . $request->userId . ': ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
