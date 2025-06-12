<?php


namespace App\Http\Controllers\Auth;


use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class SessionController extends Controller {


    public function create() {
        return view('auth.login');
    }


    public function store(Request $request) {
        try {
            $campos = request()->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);


            // Buscar el usuario por email
            $user = User::where('email', $campos['email'])->first();


            // Verificar si el usuario existe y si la contraseña coincide
            if (!$user || !password_verify($campos['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas',
                    'errors' => [
                        'email' => ['Las credenciales proporcionadas no coinciden con nuestros registros.']
                    ]
                ], 422);
            }


            // Iniciar sesión usando el sistema de autenticación de Laravel
            Auth::login($user);


            // Obtener los datos del player
            $player = DB::table('PLAYERS')->where('user_id', $user->id)->first();


            // Devolver respuesta JSON con el usuario autenticado
            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'player' => $player
                ]
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy() {
        try {
            Auth::logout(); // Laravel maneja el logout por sí mismo
            // Invalidar la sesión actual
            session()->invalidate();


            // Regenerar el token de sesión
            session()->regenerateToken();


            // Limpiar todos los datos de la sesión
            session()->flush();


            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}




