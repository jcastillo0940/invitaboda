<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guest_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_group_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->boolean('is_attending')->nullable();
            $table->string('menu_choice')->nullable();
            $table->string('drink_choice')->nullable();
            $table->text('allergies')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_members');
    }
};
