<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController {

    public function index(): JsonResponse
    {
        $products = DB::table("PRODUCTS")->get();
        $upgrades = DB::table("UPGRADES")->get();
        $achievements = DB::table("ACHIEVEMENTS")->get();
        $quotes = DB::table("QUOTES")->get();
        $oils = DB::table("OILS")->get();

        return response()->json([
            'products' => $products,
            'upgrades' => $upgrades,
            'achievements' => $achievements,
            'quotes' => $quotes,
            'oils' => $oils,
        ]);
    }

    public function updateOlives(Request $request)
    {
        try {
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user = auth()->user();
            $player = DB::table('PLAYERS')->where('user_id', $user->id)->first();

            if (!$player) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jugador no encontrado'
                ], 404);
            }

            // Validar los datos recibidos
            $validated = $request->validate([
                'olives_count' => 'required|numeric|min:0',
                'olives_count_total' => 'required|numeric|min:0',
                'olives_count_clicked' => 'required|numeric|min:0',
                'products_owned' => 'nullable|string',
                'upgrades_owned' => 'nullable|string',
                'achievements_count' => 'required|numeric|min:0',
                'achievements_obtained' => 'nullable|string'
            ]);

            // Actualizar datos del jugador
            DB::table('PLAYERS')
                ->where('user_id', $user->id)
                ->update([
                    'olives_count' => $validated['olives_count'],
                    'olives_count_total' => $validated['olives_count_total'],
                    'olives_count_clicked' => $validated['olives_count_clicked'],
                    'products_owned' => $validated['products_owned'] ?? $player->products_owned,
                    'upgrades_owned' => $validated['upgrades_owned'] ?? $player->upgrades_owned,
                    'achievements_count' => $validated['achievements_count'],
                    'achievements_obtained' => $validated['achievements_obtained'] ?? $player->achievements_obtained,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Datos del juego actualizados correctamente',
                'olives_count' => $validated['olives_count'],
                'olives_count_total' => $validated['olives_count_total'],
                'olives_count_clicked' => $validated['olives_count_clicked'],
                'products_owned' => $validated['products_owned'] ?? $player->products_owned,
                'upgrades_owned' => $validated['upgrades_owned'] ?? $player->upgrades_owned,
                'achievements_count' => $validated['achievements_count'],
                'achievements_obtained' => $validated['achievements_obtained'] ?? $player->achievements_obtained
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar datos del juego: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar datos del juego'
            ], 500);
        }
    }
}
