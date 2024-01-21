<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\AndroidConfig;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use Kreait\Laravel\Firebase\Facades\FirebaseMessaging;
use Kreait\Firebase\Factory;
use App\Models\User;

class PushNotification extends Notification
{
    use Queueable;

    public function sendMultipleNotifications()
    {
        // Retrieve device tokens from your database or storage
        $deviceTokens = collect([
            // ... list of device tokens ...
        ]);

        $factory = (new Factory)->withServiceAccount(config('services.firebase.credentials.file'));
        $messaging = $factory->createMessaging();

        $title = 'Shelter Solutions 360';
        $body = 'Notification Body';

        foreach ($deviceTokens as $deviceToken) {
            try {
                $message = CloudMessage::new()
                    ->withNotification(FirebaseNotification::create($title, $body))
                    ->withData(['key' => 'value'])
                    ->setToken($deviceToken);

                $messaging->send($message);
            } catch (\Throwable $e) {
                // Handle errors gracefully, e.g., log the failed message and token
                \Log::error("Failed to send FCM notification: {$e->getMessage()}");
            }
        }

        // Return a response indicating success or failure
        return response()->json(['status' => 'success']);
    }

    public function sendWebNotification(Request $request)
    {
        $url = 'https://fcm.googleapis.com/fcm/send';
        $FcmToken = User::whereNotNull('remember_token')->pluck('remember_token')->all();
          
        $serverKey = 'server key goes here';
  
        $data = [
            "registration_ids" => $FcmToken,
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
        // Disabling SSL Certificate support temporarly
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);        
        curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedData);
        // Execute post
        $result = curl_exec($ch);
        if ($result === FALSE) {
            die('Curl failed: ' . curl_error($ch));
        }        
        // Close connection
        curl_close($ch);
        // FCM response
        dd($result);        
    }
}
