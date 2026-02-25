<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'site_name' => 'Invitaciones Digitales',
            'contact_email' => 'admin@tuweb.com',
            'currency' => 'USD',
            'payment_mode' => 'sandbox',
        ];

        foreach ($defaults as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}