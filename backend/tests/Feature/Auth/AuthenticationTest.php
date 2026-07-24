<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private int $roleId;

    protected function setUp(): void
    {
        parent::setUp();

        // Login/logout mechanics don't depend on which role a user has, but
        // role_id is required, so seed the real domain roles and pick one
        // explicitly rather than letting the factory assume a role.
        $this->seed(RoleSeeder::class);
        $this->roleId = Role::where('name', 'backend')->value('id');
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create(['role_id' => $this->roleId]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertNoContent();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create(['role_id' => $this->roleId]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create(['role_id' => $this->roleId]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertNoContent();
    }

    public function test_successful_login_updates_last_login_at(): void
    {
        $user = User::factory()->create(['role_id' => $this->roleId]);
        $this->assertNull($user->last_login_at);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_authenticated_user_endpoint_returns_profile_fields(): void
    {
        $user = User::factory()->create(['role_id' => $this->roleId]);

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertOk();
        $response->assertJsonPath('data.id', $user->id);
        $response->assertJsonPath('data.role.id', $this->roleId);
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'role' => ['id', 'name'], 'last_login_at', 'created_at'],
        ]);
    }
}
