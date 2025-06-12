<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function deleteComment($id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        try {
            DB::beginTransaction();

            $comment = DB::table('COMMENTS')->where('id', $id)->first();
            if (!$comment) {
                return response()->json(['success' => false, 'message' => 'Comentario no encontrado'], 404);
            }

            DB::table('COMMENTS')->where('id', $id)->delete();

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Comentario eliminado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al eliminar comentario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el comentario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
