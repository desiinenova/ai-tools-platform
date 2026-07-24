<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TwoFactorAuthenticationController extends Controller
{
    /** Starts enrollment. Not yet enforced at login until confirm() succeeds. */
    public function store(Request $request, TwoFactorAuthenticationService $service)
    {
        $secret = $service->enable($request->user());

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $service->qrCodeUrl($request->user()),
        ]);
    }

    public function confirm(Request $request, TwoFactorAuthenticationService $service)
    {
        $request->validate(['code' => ['required', 'string']]);

        $recoveryCodes = $service->confirm($request->user(), $request->string('code')->trim()->value());

        if ($recoveryCodes === null) {
            throw ValidationException::withMessages([
                'code' => 'The provided code was invalid.',
            ]);
        }

        return response()->json(['recovery_codes' => $recoveryCodes]);
    }

    /** Requires the current password or a valid code, so a hijacked/left-open session can't silently turn 2FA off. */
    public function destroy(Request $request, TwoFactorAuthenticationService $service)
    {
        $request->validate([
            'password' => ['nullable', 'string'],
            'code' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        $passwordValid = $request->filled('password') && Hash::check($request->input('password'), $user->password);
        $codeValid = $request->filled('code') && $service->verify($user->two_factor_secret, $request->input('code'));

        if (! $passwordValid && ! $codeValid) {
            throw ValidationException::withMessages([
                'password' => 'Enter your password or a valid authentication code to disable two-factor authentication.',
            ]);
        }

        $service->disable($user);

        return response()->noContent();
    }

    public function regenerateRecoveryCodes(Request $request, TwoFactorAuthenticationService $service)
    {
        abort_unless($request->user()->two_factor_confirmed_at, 409, 'Two-factor authentication is not enabled.');

        return response()->json(['recovery_codes' => $service->regenerateRecoveryCodes($request->user())]);
    }
}
