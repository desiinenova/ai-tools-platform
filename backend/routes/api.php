<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ToolController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    });

    Route::get('/roles', [RoleController::class, 'index']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('tags', TagController::class);
    Route::apiResource('tools', ToolController::class);
    Route::patch('tools/{tool}/approve', [ToolController::class, 'approve']);
    Route::patch('tools/{tool}/reject', [ToolController::class, 'reject']);
});

require __DIR__.'/auth.php';
