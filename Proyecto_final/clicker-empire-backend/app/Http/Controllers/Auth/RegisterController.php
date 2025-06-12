<?php


namespace App\Http\Controllers\Auth;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;


class RegisterController extends Controller {


    public function create() {
        return view('auth.register');
    }


    public function store(Request $request) {
        $request->validate([
            'name' => ['required', 'string', 'max:20'],
            'user_name' => ['required', 'string', 'max:20', 'unique:PLAYERS,user_name'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:USERS,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);


        try {
            DB::beginTransaction();


            // Crear usuario
            $userId = DB::table('USERS')->insertGetId([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'player',
                'created_at' => now(),
                'updated_at' => now()
            ]);


            // Crear jugador
            DB::table('PLAYERS')->insert([
                'user_id' => $userId,
                'user_name' => $request->user_name,
                'store_name' => 'La finca de ' . $request->user_name,
                'olives_count' => 0,
                'olives_count_total' => 0,
                'olives_count_clicked' => 0,
                'products_owned' => '[]',
                'upgrades_owned' => '[]',
                'achievements_count' => 0,
                'achievements_obtained' => '[]',
                'created_at' => now(),
                'updated_at' => now()
            ]);


            DB::commit();


            // Iniciar sesión automáticamente
            $user = DB::table('USERS')->where('id', $userId)->first();
            Auth::loginUsingId($userId);


            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);


        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}





