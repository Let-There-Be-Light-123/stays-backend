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
        Schema::create('users', function (Blueprint $table) {
            $table->bigInteger('social_security')->unsigned()->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->integer('phone')->nullable();
            $table->string('role_id')->nullable();
            $table->boolean('is_verified');
            $table->boolean('is_active');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->unsignedBigInteger('address_id')->nullable();
            $table->rememberToken()->default('');
            $table->timestamps();

            $table->foreign('role_id')->references('role_id')->on('roles');
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user');
    }
};
