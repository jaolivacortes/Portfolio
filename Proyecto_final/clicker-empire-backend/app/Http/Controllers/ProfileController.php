<?php

namespace App\Http\Controllers;


use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller {
    public function show() {
        $user = Auth::user();
        $player = DB::table('PLAYERS')->where('user_id', $user->id)->first();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'player' => $player
            ]
        ]);
    }

    public function update(Request $request) {
        $user = Auth::user();

        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:20',
                'email' => 'sometimes|email|max:255|unique:USERS,email,' . $user->id,
                'store_name' => 'sometimes|string|max:255',
                'current_password' => 'required_with:new_password|string',
                'new_password' => 'sometimes|string|min:6|confirmed',
            ]);

            // Verificar la contraseña actual si se está cambiando la contraseña
            if (isset($validated['current_password'])) {
                if (!Hash::check($validated['current_password'], $user->password)) {
                    throw ValidationException::withMessages([
                        'current_password' => ['La contraseña actual no es correcta.'],
                    ]);
                }
            }

            DB::beginTransaction();

            // Actualizar los datos del usuario
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }
            if (isset($validated['new_password'])) {
                $user->password = Hash::make($validated['new_password']);
            }

            $user->save();

            // Actualizar el store_name del player si se proporciona
            if (isset($validated['store_name'])) {
                DB::table('PLAYERS')
                    ->where('user_id', $user->id)
                    ->update([
                        'store_name' => 'La finca de ' . $validated['store_name'],
                        'updated_at' => now()
                    ]);
            }

            DB::commit();

            // Obtener los datos actualizados del player
            $player = DB::table('PLAYERS')->where('user_id', $user->id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'player' => $player
                ]
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetProgress(Request $request) {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar si el player existe
            $player = DB::table('PLAYERS')->where('user_id', $user->id)->first();
            if (!$player) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró el perfil del jugador'
                ], 404);
            }

            DB::beginTransaction();

            // Actualizar los datos del player a valores iniciales
            $updated = DB::table('PLAYERS')
                ->where('user_id', $user->id)
                ->update([
                    'olives_count' => 0,
                    'olives_count_total' => 0,
                    'olives_count_clicked' => 0,
                    'products_owned' => '{}',
                    'upgrades_owned' => '{}',
                    'achievements_obtained' => '{}',
                    'achievements_count' => 0,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                throw new \Exception('No se pudo actualizar el progreso del jugador');
            }

            DB::commit();

            // Obtener los datos actualizados del player
            $updatedPlayer = DB::table('PLAYERS')->where('user_id', $user->id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Progreso reiniciado correctamente',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'player' => $updatedPlayer
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al reiniciar progreso: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error al reiniciar el progreso: ' . $e->getMessage()
            ], 500);
        }
    }
}
