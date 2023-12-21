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
        Schema::create('customroles', function (Blueprint $table) {
            $table->string('role_id')->unique()->primary();
            $table->string('role_name');
            $table->timestamps();

        });
    }
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
