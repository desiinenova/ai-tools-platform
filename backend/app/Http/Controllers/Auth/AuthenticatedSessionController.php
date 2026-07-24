<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request. A user with confirmed 2FA
     * doesn't get a session yet — their id is stashed pending a successful
     * TwoFactorChallengeController call, which is what actually logs them in.
     */
    public function store(LoginRequest $request): SymfonyResponse
    {
        $user = $request->authenticate();

        if ($user->two_factor_confirmed_at) {
            $request->session()->put('two_factor.user_id', $user->id);
            $request->session()->put('two_factor.remember', $request->boolean('remember'));

            return response()->json(['two_factor' => true]);
        }

        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
