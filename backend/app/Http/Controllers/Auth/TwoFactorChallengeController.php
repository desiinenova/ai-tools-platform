<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class TwoFactorChallengeController extends Controller
{
    /** Completes a login that AuthenticatedSessionController deferred pending a 2FA code. */
    public function store(Request $request, TwoFactorAuthenticationService $service): Response
    {
        $userId = $request->session()->get('two_factor.user_id');

        abort_unless($userId, 409, 'No two-factor challenge is pending.');

        $throttleKey = 'two-factor-challenge:'.$userId;

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'code' => 'Too many attempts. Please wait a moment and try again.',
            ]);
        }

        $request->validate(['code' => ['required', 'string']]);

        $user = User::findOrFail($userId);
        $code = $request->string('code')->trim()->value();

        $valid = $service->verify($user->two_factor_secret, $code)
            || $service->attemptRecoveryCode($user, $code);

        if (! $valid) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'code' => 'The provided code was invalid.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        $remember = (bool) $request->session()->pull('two_factor.remember', false);
        $request->session()->forget('two_factor.user_id');

        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();

        return response()->noContent();
    }
}
