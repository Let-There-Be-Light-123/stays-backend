<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('booking_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('payload');
            $table->boolean('is_handled')->default(false);
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('webhooks');
    }
};
