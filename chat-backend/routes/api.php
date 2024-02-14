<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\UsersController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/users', [UsersController::class, 'index']);
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);

Route::group(['middleware' => ['auth:sanctum']], function() {
    Route::post('/messages', [ChatController::class, 'index']);
    Route::get('/messages/{id}', [ChatController::class, 'show']);

    Route::post('/logout', [UsersController::class, 'logout']);
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);