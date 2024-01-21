<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log; // Import the Log facade

class Verification extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationToken;

    /**
     * Create a new message instance.
     *
     * @param  string  $verificationToken
     * @return void
     */
    public function __construct($verificationToken)
    {
        $this->verificationToken = $verificationToken;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        try {
            return $this->subject('Verify Your Email')
                ->view('emails.custom');
        } catch (\Exception $e) {
            // Log an error if an exception occurs during the build process
            Log::error('Error building verification email', ['error' => $e->getMessage()]);
            throw $e; // Re-throw the exception after logging
        }
    }
}