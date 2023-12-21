<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class  extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->string('property_id')->unique()->primary();
            $table->string('property_name');
            $table->string('property_type');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_most_liked')->default(false);
            $table->integer('likes')->default(0);
            $table->boolean('on_homepage')->default(false);
            $table->text('property_description')->nullable();
            $table->string('contact')->nullable();
            $table->unsignedBigInteger('address_id')->nullable();
            $table->timestamps();

            // Indexes (if needed for searching or optimization)
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('set null');

            // Example: $table->index(['property_name', 'lat', 'lng']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
