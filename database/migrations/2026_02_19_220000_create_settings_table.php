<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // Seed default values
        DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'Invitaboda', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'hola@invitaboda.com', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'USD', 'group' => 'payments'],
            ['key' => 'payment_mode', 'value' => 'sandbox', 'group' => 'payments'],
            ['key' => 'price_basic', 'value' => '0.00', 'group' => 'pricing'],
            ['key' => 'price_premium', 'value' => '25.00', 'group' => 'pricing'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
