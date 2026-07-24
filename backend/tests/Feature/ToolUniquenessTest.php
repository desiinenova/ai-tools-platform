<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolUniquenessTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $ownerRole = Role::create(['name' => Role::OWNER]);
        $this->owner = User::factory()->create(['role_id' => $ownerRole->id]);
    }

    private function toolPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'ChatGPT',
            'website_url' => 'https://chatgpt.com',
            'description' => 'An AI assistant.',
        ], $overrides);
    }

    public function test_tool_name_must_be_unique_case_insensitively(): void
    {
        Tool::create([...$this->toolPayload(), 'created_by' => $this->owner->id, 'status' => 'approved']);

        $response = $this->actingAs($this->owner)->postJson('/api/tools', $this->toolPayload([
            'name' => 'chatgpt',
            'website_url' => 'https://a-different-url.example.com',
        ]));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name']);
        $response->assertJsonFragment(['name' => ['A tool with this name already exists.']]);
    }

    public function test_creating_a_tool_normalizes_a_trailing_slash_in_website_url(): void
    {
        $response = $this->actingAs($this->owner)->postJson('/api/tools', $this->toolPayload([
            'website_url' => 'https://chatgpt.com/',
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.website_url', 'https://chatgpt.com');
    }

    public function test_tool_website_url_must_be_unique_after_trailing_slash_normalization(): void
    {
        $this->actingAs($this->owner)->postJson('/api/tools', $this->toolPayload([
            'website_url' => 'https://chatgpt.com',
        ]))->assertCreated();

        $response = $this->actingAs($this->owner)->postJson('/api/tools', $this->toolPayload([
            'name' => 'A Different Name',
            'website_url' => 'https://chatgpt.com/',
        ]));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['website_url']);
        $response->assertJsonFragment(['website_url' => ['A tool with this website URL already exists.']]);
    }

    public function test_duplicate_tool_name_is_rejected_regardless_of_existing_tools_status(): void
    {
        Tool::create([
            ...$this->toolPayload(),
            'created_by' => $this->owner->id,
            'status' => 'rejected',
        ]);

        $response = $this->actingAs($this->owner)->postJson('/api/tools', $this->toolPayload([
            'name' => 'CHATGPT',
            'website_url' => 'https://a-different-url.example.com',
        ]));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_updating_a_tool_does_not_conflict_with_its_own_name_or_url(): void
    {
        $tool = Tool::create([...$this->toolPayload(), 'created_by' => $this->owner->id, 'status' => 'approved']);

        $response = $this->actingAs($this->owner)->putJson("/api/tools/{$tool->id}", $this->toolPayload([
            'description' => 'Updated description, same name and URL.',
        ]));

        $response->assertOk();
    }

    public function test_updating_a_tool_with_another_tools_name_is_rejected(): void
    {
        Tool::create([...$this->toolPayload(), 'created_by' => $this->owner->id, 'status' => 'approved']);

        $other = Tool::create([
            'name' => 'Claude',
            'website_url' => 'https://claude.ai',
            'description' => 'A different tool.',
            'created_by' => $this->owner->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->owner)->putJson("/api/tools/{$other->id}", $this->toolPayload([
            'name' => 'chatgpt',
            'website_url' => $other->website_url,
        ]));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_database_unique_constraint_prevents_duplicate_tools_bypassing_validation(): void
    {
        Tool::create([...$this->toolPayload(), 'created_by' => $this->owner->id, 'status' => 'approved']);

        $this->expectException(QueryException::class);

        Tool::create([...$this->toolPayload(), 'created_by' => $this->owner->id, 'status' => 'approved']);
    }
}
