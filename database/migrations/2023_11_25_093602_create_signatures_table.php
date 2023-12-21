<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->string('booking_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->text('signature'); // Store the signature as a text field
            $table->timestamps();
    
            $table->foreign('booking_id')->references('booking_reference')->on('bookings')->onDelete('set null');
            $table->foreign('user_id')->references('social_security')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signatures');
    }
};
