<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Role;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ToolControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'owner']);
        $this->user = User::factory()->create(['role_id' => $role->id]);
    }

    public function test_roles_endpoint_lists_roles(): void
    {
        Role::create(['name' => 'backend']);

        $response = $this->actingAs($this->user)->getJson('/api/roles');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['name' => 'backend']);
    }

    public function test_index_can_be_filtered_by_created_by(): void
    {
        $otherUser = User::factory()->create(['role_id' => $this->user->role_id]);

        $ownTool = Tool::create([
            'name' => 'Mine',
            'website_url' => 'https://example.com',
            'description' => 'Created by the acting user.',
            'created_by' => $this->user->id,
            'status' => 'approved',
        ]);

        Tool::create([
            'name' => 'Someone else\'s',
            'website_url' => 'https://another-example.com',
            'description' => 'Created by another user.',
            'created_by' => $otherUser->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->user)->getJson("/api/tools?created_by={$this->user->id}");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $ownTool->id);
    }

    public function test_it_creates_a_tool_with_a_markdown_documentation_body(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/tools', [
            'name' => 'Documented Tool',
            'website_url' => 'https://example.com',
            'description' => 'A tool with markdown documentation.',
            'documentation_body' => "# Setup\n\n1. Install it\n2. Run it",
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.documentation_body', "# Setup\n\n1. Install it\n2. Run it");
    }

    public function test_it_creates_a_tool_with_an_uploaded_image(): void
    {
        Storage::fake('public');

        $category = Category::create(['name' => 'Testing Category']);
        $tag = Tag::create(['name' => 'testing-tag']);

        $response = $this->actingAs($this->user)->post('/api/tools', [
            'name' => 'Test Tool',
            'website_url' => 'https://example.com',
            'description' => 'A tool for testing.',
            'category_ids' => [$category->id],
            'role_ids' => [$this->user->role_id],
            'tag_ids' => [$tag->id],
            'image' => UploadedFile::fake()->image('logo.png', 200, 200),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.name', 'Test Tool');
        $this->assertNotNull($response->json('data.image_url'));

        $tool = Tool::firstWhere('name', 'Test Tool');
        $this->assertNotNull($tool->image_path);
        Storage::disk('public')->assertExists($tool->image_path);
    }

    public function test_it_creates_a_tool_with_a_genuinely_small_real_image(): void
    {
        // UploadedFile::fake()->image() always generates a proper GD image at
        // real dimensions. This uses an actual minimal (68-byte) real PNG
        // instead, to guard against any regression specific to very small
        // files rather than the synthetic ones the other tests use.
        Storage::fake('public');

        $bytes = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
        );
        $path = tempnam(sys_get_temp_dir(), 'test').'.png';
        file_put_contents($path, $bytes);

        $response = $this->actingAs($this->user)->post('/api/tools', [
            'name' => 'Tiny Image Tool',
            'website_url' => 'https://example.com',
            'description' => 'Tests a genuinely small real image upload.',
            'image' => new UploadedFile($path, 'tiny.png', 'image/png', null, true),
        ]);

        $response->assertCreated();
        $this->assertNotNull($response->json('data.image_url'));

        $tool = Tool::firstWhere('name', 'Tiny Image Tool');
        $this->assertNotNull($tool->image_path);
        Storage::disk('public')->assertExists($tool->image_path);

        unlink($path);
    }

    public function test_updating_a_tool_with_a_new_image_deletes_the_old_one(): void
    {
        Storage::fake('public');

        $tool = Tool::create([
            'name' => 'Original',
            'website_url' => 'https://example.com',
            'description' => 'Original description.',
            'image_path' => UploadedFile::fake()->image('old.png')->store('tools', 'public'),
            'created_by' => $this->user->id,
        ]);

        $oldPath = $tool->image_path;

        $response = $this->actingAs($this->user)->post("/api/tools/{$tool->id}", [
            '_method' => 'PUT',
            'name' => 'Updated',
            'website_url' => 'https://example.com',
            'description' => 'Updated description.',
            'image' => UploadedFile::fake()->image('new.png'),
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($tool->fresh()->image_path);
    }

    public function test_deleting_a_tool_removes_its_image(): void
    {
        Storage::fake('public');

        $tool = Tool::create([
            'name' => 'To Delete',
            'website_url' => 'https://example.com',
            'description' => 'Will be deleted.',
            'image_path' => UploadedFile::fake()->image('delete-me.png')->store('tools', 'public'),
            'created_by' => $this->user->id,
        ]);

        $imagePath = $tool->image_path;

        $response = $this->actingAs($this->user)->deleteJson("/api/tools/{$tool->id}");

        $response->assertNoContent();
        Storage::disk('public')->assertMissing($imagePath);
    }
}
