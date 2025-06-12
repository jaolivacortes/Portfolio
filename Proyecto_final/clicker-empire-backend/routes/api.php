<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RankingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas
Route::middleware('web')->group(function () {
    // Token CSRF
    Route::get('/csrf-token', function () {
        return response()->json([
            'csrf_token' => csrf_token(),
            'session_id' => session()->getId()
        ]);
    });

    // Autenticación
    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [SessionController::class, 'store']);
    Route::delete('/logout', [SessionController::class, 'destroy']);

    // Verificación de autenticación
    Route::get('/check-auth', function (Request $request) {
        return response()->json([
            'authenticated' => auth()->check(),
            'user' => auth()->user()
        ]);
    });
});

// Rutas protegidas
Route::middleware(['auth', 'web'])->group(function () {
    // Perfil
    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/reset-progress', [ProfileController::class, 'resetProgress']);

    Route::get('/achievements', function () {
        return response()->json(['message' => 'Achievements API working fine!']);
    });

    // Game
    Route::get('/game', [GameController::class, 'index']);
    Route::put('/game/olives', [GameController::class, 'updateOlives']);

    // Ranking
    Route::get('/ranking', [RankingController::class, 'index']);

    // Forum
    Route::get('/forum/comments', [ForumController::class, 'getComments']);
    Route::post('/forum/comments', [ForumController::class, 'storeComment']);

    // Admin: borrar comentario
    Route::delete('/admin/forum/comments/{id}', [\App\Http\Controllers\AdminController::class, 'deleteComment']);
});

// Home
Route::get('/home', [HomeController::class, 'index']);

// Ruta de prueba CORS
Route::get('/cors-test', function () {
    return response()->json(['message' => 'CORS funcionando']);
});
