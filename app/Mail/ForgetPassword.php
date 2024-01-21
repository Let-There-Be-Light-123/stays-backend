<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgetPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $tempPassword;

    /**
     * Create a new message instance.
     *
     * @param  string  $tempPassword
     * @return void
     */
    public function __construct($tempPassword)
    {
        $this->tempPassword = $tempPassword;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Reset Your Password')
            ->view('emails.forget_password')
            ->with(['tempPassword' => $this->tempPassword]);
            // ->embed(public_path('storage/public/uploads/default/logo.png'), 'logo');
    }
}
