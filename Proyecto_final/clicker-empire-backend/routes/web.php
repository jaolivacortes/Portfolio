<?php

use Illuminate\Support\Facades\Route;

// Ruta para servir el index.html
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
});

// Ruta para manejar todas las demás rutas del SPA
Route::fallback(function () {
    return file_get_contents(public_path('index.html'));
});
