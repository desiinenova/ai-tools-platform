<?php

namespace Tests\Feature;

use App\Enums\ToolStatus;
use App\Models\Role;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $creator;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $ownerRole = Role::create(['name' => Role::OWNER]);
        $backendRole = Role::create(['name' => 'backend']);

        $this->owner = User::factory()->create(['role_id' => $ownerRole->id]);
        $this->creator = User::factory()->create(['role_id' => $backendRole->id]);
        $this->otherUser = User::factory()->create(['role_id' => $backendRole->id]);
    }

    private function baseToolPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Tool',
            'website_url' => 'https://example.com',
            'description' => 'A tool for testing the approval workflow.',
        ], $overrides);
    }

    public function test_tool_created_by_owner_is_auto_approved(): void
    {
        $response = $this->actingAs($this->owner)->postJson('/api/tools', $this->baseToolPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.status', ToolStatus::Approved->value);
    }

    public function test_tool_created_by_regular_user_is_pending(): void
    {
        $response = $this->actingAs($this->creator)->postJson('/api/tools', $this->baseToolPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.status', ToolStatus::Pending->value);
    }

    public function test_owner_can_approve_a_pending_tool(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->owner)->patchJson("/api/tools/{$tool->id}/approve");

        $response->assertOk();
        $response->assertJsonPath('data.status', ToolStatus::Approved->value);
    }

    public function test_owner_can_reject_a_pending_tool(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->owner)->patchJson("/api/tools/{$tool->id}/reject");

        $response->assertOk();
        $response->assertJsonPath('data.status', ToolStatus::Rejected->value);
    }

    public function test_regular_user_cannot_approve_a_tool(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->creator)->patchJson("/api/tools/{$tool->id}/approve");

        $response->assertForbidden();
    }

    public function test_regular_user_cannot_reject_a_tool(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->creator)->patchJson("/api/tools/{$tool->id}/reject");

        $response->assertForbidden();
    }

    public function test_creator_editing_an_approved_tool_resets_it_to_pending(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Approved]);

        $response = $this->actingAs($this->creator)->putJson("/api/tools/{$tool->id}", $this->baseToolPayload(['name' => 'Updated name']));

        $response->assertOk();
        $response->assertJsonPath('data.status', ToolStatus::Pending->value);
    }

    public function test_owner_editing_a_tool_does_not_change_its_status(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->owner)->putJson("/api/tools/{$tool->id}", $this->baseToolPayload(['name' => 'Updated by owner']));

        $response->assertOk();
        $response->assertJsonPath('data.status', ToolStatus::Pending->value);
    }

    public function test_pending_tool_is_hidden_from_other_users_in_the_index(): void
    {
        Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->otherUser)->getJson('/api/tools');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_pending_tool_is_visible_to_its_creator_in_the_index(): void
    {
        Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->creator)->getJson('/api/tools');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_pending_tool_is_visible_to_owner_in_the_index(): void
    {
        Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->owner)->getJson('/api/tools');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_other_user_cannot_view_a_pending_tool_directly(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->otherUser)->getJson("/api/tools/{$tool->id}");

        $response->assertForbidden();
    }

    public function test_creator_can_view_their_own_pending_tool_directly(): void
    {
        $tool = Tool::create([...$this->baseToolPayload(), 'created_by' => $this->creator->id, 'status' => ToolStatus::Pending]);

        $response = $this->actingAs($this->creator)->getJson("/api/tools/{$tool->id}");

        $response->assertOk();
    }
}
