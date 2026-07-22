<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['email' => 'owner@example.com', 'name' => 'Owner User', 'role' => 'owner'],
            ['email' => 'backend@example.com', 'name' => 'Backend Developer', 'role' => 'backend'],
            ['email' => 'frontend@example.com', 'name' => 'Frontend Developer', 'role' => 'frontend'],
            ['email' => 'pm@example.com', 'name' => 'Project Manager', 'role' => 'pm'],
            ['email' => 'qa@example.com', 'name' => 'QA Engineer', 'role' => 'qa'],
            ['email' => 'designer@example.com', 'name' => 'Designer', 'role' => 'designer'],
        ];

        foreach ($users as $user) {
            $role = Role::where('name', $user['role'])->firstOrFail();

            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'role_id' => $role->id,
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
