<?php

// EmailController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationEmail;

class EmailController extends Controller
{
    /**
     * Send a verification email.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendVerificationEmail(Request $request)
    {
        // Validate the request data, e.g., email address
        $request->validate([
            'email' => 'required|email',
        ]);

        // Get the email address from the request
        $email = $request->input('email');

        // Generate a unique verification token (you may use something like Str::uuid())
        $verificationToken = bin2hex(random_bytes(32));

        // Store the verification token in the database or cache for later verification

        // Send the verification email
        Mail::to($email)->send(new VerificationEmail($verificationToken));

        // Return a response
        return response(['message' => 'Verification email sent successfully'], 200);
    }
}
