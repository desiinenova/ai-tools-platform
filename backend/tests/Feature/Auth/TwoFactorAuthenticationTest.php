<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Google2FA $google2fa;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'backend']);
        $this->user = User::factory()->create(['role_id' => $role->id]);
        $this->google2fa = app(Google2FA::class);
    }

    private function currentCodeFor(User $user): string
    {
        return $this->google2fa->getCurrentOtp($user->fresh()->two_factor_secret);
    }

    public function test_user_can_enable_two_factor_authentication(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication');

        $response->assertOk();
        $response->assertJsonStructure(['secret', 'qr_code_url']);

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);
        $this->assertNull($this->user->two_factor_confirmed_at);
    }

    public function test_user_can_confirm_two_factor_authentication_with_a_valid_code(): void
    {
        $this->actingAs($this->user)->postJson('/api/two-factor-authentication')->assertOk();

        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication/confirm', [
            'code' => $this->currentCodeFor($this->user),
        ]);

        $response->assertOk();
        $response->assertJsonCount(8, 'recovery_codes');

        $this->assertNotNull($this->user->fresh()->two_factor_confirmed_at);
    }

    public function test_confirming_with_an_invalid_code_fails(): void
    {
        $this->actingAs($this->user)->postJson('/api/two-factor-authentication')->assertOk();

        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication/confirm', [
            'code' => '000000',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['code']);
        $this->assertNull($this->user->fresh()->two_factor_confirmed_at);
    }

    public function test_login_does_not_require_a_challenge_for_users_without_two_factor(): void
    {
        $response = $this->postJson('/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertNoContent();
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_login_requires_a_challenge_for_users_with_confirmed_two_factor(): void
    {
        $this->enableAndConfirmTwoFactor();

        $response = $this->postJson('/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson(['two_factor' => true]);
        $this->assertGuest();
    }

    public function test_two_factor_challenge_completes_login_with_a_valid_totp_code(): void
    {
        $this->enableAndConfirmTwoFactor();

        $this->postJson('/login', ['email' => $this->user->email, 'password' => 'password'])
            ->assertOk();

        $response = $this->postJson('/two-factor-challenge', [
            'code' => $this->currentCodeFor($this->user),
        ]);

        $response->assertNoContent();
        $this->assertAuthenticatedAs($this->user);
        $this->assertNotNull($this->user->fresh()->last_login_at);
    }

    public function test_two_factor_challenge_completes_login_with_a_valid_recovery_code_and_consumes_it(): void
    {
        $recoveryCodes = $this->enableAndConfirmTwoFactor();
        $code = $recoveryCodes[0];

        $this->postJson('/login', ['email' => $this->user->email, 'password' => 'password'])
            ->assertOk();

        $response = $this->postJson('/two-factor-challenge', ['code' => $code]);

        $response->assertNoContent();
        $this->assertAuthenticatedAs($this->user);
        $this->assertNotContains($code, $this->user->fresh()->two_factor_recovery_codes);
    }

    public function test_two_factor_challenge_fails_with_an_invalid_code(): void
    {
        $this->enableAndConfirmTwoFactor();

        $this->postJson('/login', ['email' => $this->user->email, 'password' => 'password'])
            ->assertOk();

        $response = $this->postJson('/two-factor-challenge', ['code' => '000000']);

        $response->assertUnprocessable();
        $this->assertGuest();
    }

    public function test_two_factor_challenge_is_rate_limited(): void
    {
        $this->enableAndConfirmTwoFactor();
        RateLimiter::clear('two-factor-challenge:'.$this->user->id);

        $this->postJson('/login', ['email' => $this->user->email, 'password' => 'password'])
            ->assertOk();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/two-factor-challenge', ['code' => '000000']);
        }

        $response = $this->postJson('/two-factor-challenge', ['code' => $this->currentCodeFor($this->user)]);

        $response->assertUnprocessable();
        $this->assertGuest();
    }

    public function test_disabling_two_factor_requires_a_correct_password_or_code(): void
    {
        $this->enableAndConfirmTwoFactor();

        $response = $this->actingAs($this->user)->deleteJson('/api/two-factor-authentication', [
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
        $this->assertNotNull($this->user->fresh()->two_factor_confirmed_at);
    }

    public function test_user_can_disable_two_factor_with_the_correct_password(): void
    {
        $this->enableAndConfirmTwoFactor();

        $response = $this->actingAs($this->user)->deleteJson('/api/two-factor-authentication', [
            'password' => 'password',
        ]);

        $response->assertNoContent();
        $this->assertNull($this->user->fresh()->two_factor_confirmed_at);
        $this->assertNull($this->user->fresh()->two_factor_secret);
    }

    public function test_user_can_regenerate_recovery_codes(): void
    {
        $originalCodes = $this->enableAndConfirmTwoFactor();

        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication/recovery-codes');

        $response->assertOk();
        $newCodes = $response->json('recovery_codes');

        $this->assertCount(8, $newCodes);
        $this->assertNotEquals($originalCodes, $newCodes);
    }

    public function test_regenerating_recovery_codes_requires_two_factor_to_already_be_enabled(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication/recovery-codes');

        $response->assertStatus(409);
    }

    /**
     * @return array<int, string> the recovery codes generated at confirmation
     *
     * Ends logged out — every caller uses this to set the fixture up before
     * exercising a *fresh* login attempt, and actingAs() would otherwise
     * leave the test client authenticated for subsequent requests.
     */
    private function enableAndConfirmTwoFactor(): array
    {
        $this->actingAs($this->user)->postJson('/api/two-factor-authentication')->assertOk();

        $response = $this->actingAs($this->user)->postJson('/api/two-factor-authentication/confirm', [
            'code' => $this->currentCodeFor($this->user),
        ]);

        // actingAs() caches a "logged in" guard instance in the container;
        // forgetGuards() clears it so the next request in this test really
        // starts from a guest state, as a real subsequent login attempt would.
        $this->app['auth']->forgetGuards();

        return $response->json('recovery_codes');
    }
}
