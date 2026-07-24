<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthenticationService
{
    public function __construct(private readonly Google2FA $google2fa) {}

    /** Starts enrollment: generates and stores a secret, but 2FA isn't enforced until confirm() succeeds. */
    public function enable(User $user): string
    {
        $secret = $this->google2fa->generateSecretKey();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return $secret;
    }

    public function qrCodeUrl(User $user): string
    {
        return $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $user->two_factor_secret,
        );
    }

    /** Verifies the enrollment code, activates 2FA, and returns a fresh set of recovery codes — or null if the code was wrong. */
    public function confirm(User $user, string $code): ?array
    {
        if (! $this->verify($user->two_factor_secret, $code)) {
            return null;
        }

        $recoveryCodes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => $recoveryCodes,
        ])->save();

        return $recoveryCodes;
    }

    public function disable(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        $codes = $this->generateRecoveryCodes();

        $user->forceFill(['two_factor_recovery_codes' => $codes])->save();

        return $codes;
    }

    public function verify(?string $secret, string $code): bool
    {
        if (! $secret) {
            return false;
        }

        return $this->google2fa->verifyKey($secret, $code) !== false;
    }

    /** Recovery codes are single-use — a successful attempt consumes it. */
    public function attemptRecoveryCode(User $user, string $code): bool
    {
        $codes = $user->two_factor_recovery_codes ?? [];

        if (! in_array($code, $codes, true)) {
            return false;
        }

        $user->forceFill([
            'two_factor_recovery_codes' => array_values(array_diff($codes, [$code])),
        ])->save();

        return true;
    }

    private function generateRecoveryCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn () => Str::random(10).'-'.Str::random(10))
            ->all();
    }
}
