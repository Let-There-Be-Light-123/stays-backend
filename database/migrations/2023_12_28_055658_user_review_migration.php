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
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('social_security'); // Assuming you have a users table
            $table->string('property_id'); // Assuming you have a properties table
            $table->integer('rating');
            $table->text('comment');
            $table->timestamps();

            $table->foreign('social_security')->references('social_security')->on('users');
            $table->foreign('property_id')->references('property_id')->on('properties');


        });
    }


    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};
