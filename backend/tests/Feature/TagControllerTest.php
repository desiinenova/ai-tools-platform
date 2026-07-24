<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $ownerRole = Role::create(['name' => Role::OWNER]);
        $backendRole = Role::create(['name' => 'backend']);

        $this->owner = User::factory()->create(['role_id' => $ownerRole->id]);
        $this->regularUser = User::factory()->create(['role_id' => $backendRole->id]);
    }

    public function test_any_authenticated_user_can_list_tags(): void
    {
        Tag::create(['name' => 'testing-tag']);

        $response = $this->actingAs($this->regularUser)->getJson('/api/tags');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_tag_list_reports_how_many_tools_use_each_tag(): void
    {
        $tag = Tag::create(['name' => 'automation']);

        $tool = Tool::create([
            'name' => 'Uses It',
            'website_url' => 'https://example.com',
            'description' => 'Attached to the tag.',
            'created_by' => $this->owner->id,
            'status' => 'approved',
        ]);
        $tool->tags()->attach($tag->id);

        $response = $this->actingAs($this->regularUser)->getJson('/api/tags');

        $response->assertOk();
        $response->assertJsonPath('data.0.tools_count', 1);
    }

    public function test_owner_can_create_a_tag(): void
    {
        $response = $this->actingAs($this->owner)->postJson('/api/tags', [
            'name' => 'new-tag',
        ]);

        $response->assertCreated();
    }

    public function test_regular_user_cannot_create_a_tag(): void
    {
        $response = $this->actingAs($this->regularUser)->postJson('/api/tags', [
            'name' => 'new-tag',
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_update_a_tag(): void
    {
        $tag = Tag::create(['name' => 'original-tag']);

        $response = $this->actingAs($this->owner)->putJson("/api/tags/{$tag->id}", [
            'name' => 'renamed-tag',
        ]);

        $response->assertOk();
    }

    public function test_regular_user_cannot_update_a_tag(): void
    {
        $tag = Tag::create(['name' => 'original-tag']);

        $response = $this->actingAs($this->regularUser)->putJson("/api/tags/{$tag->id}", [
            'name' => 'renamed-tag',
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_delete_a_tag(): void
    {
        $tag = Tag::create(['name' => 'deletable-tag']);

        $response = $this->actingAs($this->owner)->deleteJson("/api/tags/{$tag->id}");

        $response->assertNoContent();
    }

    public function test_regular_user_cannot_delete_a_tag(): void
    {
        $tag = Tag::create(['name' => 'not-deletable-tag']);

        $response = $this->actingAs($this->regularUser)->deleteJson("/api/tags/{$tag->id}");

        $response->assertForbidden();
    }

    public function test_deleting_a_tag_detaches_it_from_tools_without_deleting_the_tools(): void
    {
        $tag = Tag::create(['name' => 'automation']);

        $tool = Tool::create([
            'name' => 'Still Here',
            'website_url' => 'https://example.com',
            'description' => 'Must survive tag deletion.',
            'created_by' => $this->owner->id,
            'status' => 'approved',
        ]);
        $tool->tags()->attach($tag->id);

        $this->assertDatabaseHas('tag_tool', ['tool_id' => $tool->id, 'tag_id' => $tag->id]);

        $response = $this->actingAs($this->owner)->deleteJson("/api/tags/{$tag->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
        $this->assertDatabaseMissing('tag_tool', ['tag_id' => $tag->id]);
        $this->assertDatabaseHas('tools', ['id' => $tool->id, 'name' => 'Still Here']);
        $this->assertCount(0, $tool->fresh()->tags);
    }
}
