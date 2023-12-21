<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationEmail extends Mailable
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
        return $this->subject('Verify Your Email')->view('emails.verification');
    }
}
