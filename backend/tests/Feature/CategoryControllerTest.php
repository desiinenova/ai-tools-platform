<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Role;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
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

    public function test_any_authenticated_user_can_list_categories(): void
    {
        Category::create(['name' => 'Testing']);

        $response = $this->actingAs($this->regularUser)->getJson('/api/categories');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_category_list_reports_how_many_tools_use_each_category(): void
    {
        $category = Category::create(['name' => 'Automation']);

        $tool = Tool::create([
            'name' => 'Uses It',
            'website_url' => 'https://example.com',
            'description' => 'Attached to the category.',
            'created_by' => $this->owner->id,
            'status' => 'approved',
        ]);
        $tool->categories()->attach($category->id);

        $response = $this->actingAs($this->regularUser)->getJson('/api/categories');

        $response->assertOk();
        $response->assertJsonPath('data.0.tools_count', 1);
    }

    public function test_owner_can_create_a_category(): void
    {
        $response = $this->actingAs($this->owner)->postJson('/api/categories', [
            'name' => 'New Category',
        ]);

        $response->assertCreated();
    }

    public function test_regular_user_cannot_create_a_category(): void
    {
        $response = $this->actingAs($this->regularUser)->postJson('/api/categories', [
            'name' => 'New Category',
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_update_a_category(): void
    {
        $category = Category::create(['name' => 'Original']);

        $response = $this->actingAs($this->owner)->putJson("/api/categories/{$category->id}", [
            'name' => 'Renamed',
        ]);

        $response->assertOk();
    }

    public function test_regular_user_cannot_update_a_category(): void
    {
        $category = Category::create(['name' => 'Original']);

        $response = $this->actingAs($this->regularUser)->putJson("/api/categories/{$category->id}", [
            'name' => 'Renamed',
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_delete_a_category(): void
    {
        $category = Category::create(['name' => 'Deletable']);

        $response = $this->actingAs($this->owner)->deleteJson("/api/categories/{$category->id}");

        $response->assertNoContent();
    }

    public function test_regular_user_cannot_delete_a_category(): void
    {
        $category = Category::create(['name' => 'Not deletable']);

        $response = $this->actingAs($this->regularUser)->deleteJson("/api/categories/{$category->id}");

        $response->assertForbidden();
    }

    public function test_deleting_a_category_detaches_it_from_tools_without_deleting_the_tools(): void
    {
        $category = Category::create(['name' => 'Automation']);

        $tool = Tool::create([
            'name' => 'Still Here',
            'website_url' => 'https://example.com',
            'description' => 'Must survive category deletion.',
            'created_by' => $this->owner->id,
            'status' => 'approved',
        ]);
        $tool->categories()->attach($category->id);

        $this->assertDatabaseHas('category_tool', ['tool_id' => $tool->id, 'category_id' => $category->id]);

        $response = $this->actingAs($this->owner)->deleteJson("/api/categories/{$category->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertDatabaseMissing('category_tool', ['category_id' => $category->id]);
        $this->assertDatabaseHas('tools', ['id' => $tool->id, 'name' => 'Still Here']);
        $this->assertCount(0, $tool->fresh()->categories);
    }
}
