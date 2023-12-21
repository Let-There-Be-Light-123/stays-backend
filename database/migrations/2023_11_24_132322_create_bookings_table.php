<?php
// database/migrations/create_bookings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('booking_reference')->primary();
            $table->json('rooms');
            $table->json('guest_ids');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->string('status');
            $table->unsignedBigInteger('booked_by');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('booked_by')->references('social_security')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bookings');
    }
}
