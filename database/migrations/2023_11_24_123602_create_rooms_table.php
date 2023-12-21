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
        Schema::create('rooms', function (Blueprint $table) {
            $table->string('room_id')->primary();
            $table->string('property_id');
            $table->string('room_name');
            $table->boolean('is_active')->default(false);
            $table->text('room_description')->nullable();
            $table->timestamps();

            $table->foreign('property_id')->references('property_id')->on('properties');
            
            $table->unique(['property_id', 'room_id']); // Ensure room names are unique within a property
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
