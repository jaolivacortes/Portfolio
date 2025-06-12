<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RankingController extends Controller
{
    /**
     * Obtiene el ranking de jugadores
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Obtener los jugadores con sus datos relevantes
            $players = DB::table('PLAYERS')
                ->select([
                    'PLAYERS.user_name',
                    'PLAYERS.olives_count_total',
                    'PLAYERS.olives_count_clicked',
                    'PLAYERS.products_owned',
                    'PLAYERS.achievements_count'
                ])
                ->orderBy('olives_count_total', 'desc')
                ->limit(10)
                ->get();

            // Transformar los datos para el frontend
            $players = $players->map(function ($player) {
                // Contar propiedades (sumar las cantidades de cada propiedad)
                $productsOwned = json_decode($player->products_owned, true) ?? [];
                $propertiesCount = 0;
                foreach ($productsOwned as $product) {
                    if (isset($product['count'])) {
                        $propertiesCount += $product['count'];
                    }
                }

                return [
                    'name' => $player->user_name,
                    'olivesTotal' => (int)$player->olives_count_total,
                    'olivesClick' => (int)$player->olives_count_clicked,
                    'properties' => $propertiesCount,
                    'achievements' => (int)$player->achievements_count
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Ranking obtenido correctamente',
                'players' => $players
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al obtener el ranking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el ranking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
