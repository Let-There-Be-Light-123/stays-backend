<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id(); 
            $table->string('property_id')->nullable();
            $table->string('booking_reference')->nullable();
            $table->unsignedBigInteger('social_security')->nullable();
            $table->string('filename');
            $table->string('filepath');
            $table->string('filetype');
            $table->timestamps();

            $table->foreign('property_id')->references('property_id')->on('properties');
            $table->foreign('booking_reference')->references('booking_reference')->on('bookings')->onDelete('set null');
            $table->foreign('social_security')->references('social_security')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
