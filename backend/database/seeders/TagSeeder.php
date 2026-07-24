<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tags = [
            'AI',
            'LLM',
            'Chatbot',
            'Writing',
            'Programming',
            'API',
            'Productivity',
            'Open Source',
            'Design',
            'OCR',
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(['name' => $tag]);
        }
    }
}
