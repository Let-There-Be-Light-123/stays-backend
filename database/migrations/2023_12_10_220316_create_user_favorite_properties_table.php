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
        Schema::create('user_favorite_properties', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('social_security');
            $table->string('property_id');
            $table->timestamps();

            $table->foreign('social_security')->references('social_security')->on('users')->onDelete('cascade');
            $table->foreign('property_id')->references('property_id')->on('properties')->onDelete('cascade');

            $table->unique(['social_security', 'property_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_favorite_properties');
    }
};
