<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => '¡Conexión exitosa con el backend!',
            'data' => [
                'title' => 'Bienvenido a Clicker Empire',
                'description' => 'Tu juego de clicker favorito',
                'features' => [
                    'Click y gana',
                    'Mejora tus habilidades',
                    'Compite con otros jugadores'
                ]
            ]
        ]);
    }
}
