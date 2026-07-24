<?php

use App\Http\Controllers\Auth\TwoFactorAuthenticationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ToolController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource($request->user()->load('role'));
    });

    Route::get('/roles', [RoleController::class, 'index']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('tags', TagController::class);
    Route::apiResource('tools', ToolController::class);
    Route::patch('tools/{tool}/approve', [ToolController::class, 'approve']);
    Route::patch('tools/{tool}/reject', [ToolController::class, 'reject']);

    Route::post('two-factor-authentication', [TwoFactorAuthenticationController::class, 'store']);
    Route::post('two-factor-authentication/confirm', [TwoFactorAuthenticationController::class, 'confirm']);
    Route::delete('two-factor-authentication', [TwoFactorAuthenticationController::class, 'destroy']);
    Route::post('two-factor-authentication/recovery-codes', [TwoFactorAuthenticationController::class, 'regenerateRecoveryCodes']);
});

require __DIR__.'/auth.php';
