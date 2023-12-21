<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookingGuestsTable extends Migration
{
    public function up()
    {
        Schema::create('booking_guests', function (Blueprint $table) {
            $table->id();
            $table->uuid('booking_reference');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            
            $table->foreign('booking_reference')->references('booking_reference')->on('bookings');
            $table->foreign('user_id')->references('social_security')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_guests');
    }
}
