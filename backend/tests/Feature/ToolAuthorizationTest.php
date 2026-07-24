<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $creator;

    private User $otherUser;

    private Tool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        $ownerRole = Role::create(['name' => Role::OWNER]);
        $backendRole = Role::create(['name' => 'backend']);

        $this->owner = User::factory()->create(['role_id' => $ownerRole->id]);
        $this->creator = User::factory()->create(['role_id' => $backendRole->id]);
        $this->otherUser = User::factory()->create(['role_id' => $backendRole->id]);

        $this->tool = Tool::create([
            'name' => 'Existing Tool',
            'website_url' => 'https://example.com',
            'description' => 'A tool for testing authorization.',
            'created_by' => $this->creator->id,
        ]);
    }

    public function test_creator_can_update_their_own_tool(): void
    {
        $response = $this->actingAs($this->creator)->putJson("/api/tools/{$this->tool->id}", [
            'name' => 'Updated by creator',
            'website_url' => 'https://example.com',
            'description' => 'Updated description.',
        ]);

        $response->assertOk();
    }

    public function test_creator_can_delete_their_own_tool(): void
    {
        $response = $this->actingAs($this->creator)->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertNoContent();
    }

    public function test_owner_can_update_any_tool(): void
    {
        $response = $this->actingAs($this->owner)->putJson("/api/tools/{$this->tool->id}", [
            'name' => 'Updated by owner',
            'website_url' => 'https://example.com',
            'description' => 'Updated description.',
        ]);

        $response->assertOk();
    }

    public function test_owner_can_delete_any_tool(): void
    {
        $response = $this->actingAs($this->owner)->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertNoContent();
    }

    public function test_non_creator_non_owner_cannot_update_tool(): void
    {
        $response = $this->actingAs($this->otherUser)->putJson("/api/tools/{$this->tool->id}", [
            'name' => 'Attempted update',
            'website_url' => 'https://example.com',
            'description' => 'Attempted description.',
        ]);

        $response->assertForbidden();
    }

    public function test_non_creator_non_owner_cannot_delete_tool(): void
    {
        $response = $this->actingAs($this->otherUser)->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertForbidden();
    }
}
