<?php


namespace App\Http\Controllers;


use App\Models\Comment;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;


class ForumController extends Controller
{
    /**
     * Obtiene los comentarios de una categoría específica
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getComments(Request $request): JsonResponse
    {
        try {
            $categoryId = $request->input('category_id');
            $page = $request->input('page', 1);
            $perPage = 5;


            $comments = DB::table('COMMENTS')
                ->join('USERS', 'COMMENTS.user_id', '=', 'USERS.id')
                ->join('PLAYERS', 'USERS.id', '=', 'PLAYERS.user_id')
                ->where('COMMENTS.category_id', $categoryId)
                ->orderBy('COMMENTS.created_at', 'desc')
                ->select('COMMENTS.*', 'PLAYERS.user_name')
                ->paginate($perPage, ['*'], 'page', $page);


            return response()->json([
                'success' => true,
                'message' => 'Comentarios obtenidos correctamente',
                'data' => $comments
            ]);


        } catch (\Exception $e) {
            \Log::error('Error al obtener comentarios: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los comentarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Almacena un nuevo comentario
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storeComment(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:1000',
                'category_id' => 'required|exists:CATEGORIES,id'
            ]);


            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }


            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }


            DB::beginTransaction();


            $commentId = DB::table('COMMENTS')->insertGetId([
                'user_id' => $user->id,
                'content' => $request->input('content'),
                'category_id' => $request->input('category_id'),
                'created_at' => now()
            ]);


            $comment = DB::table('COMMENTS')
                ->join('USERS', 'COMMENTS.user_id', '=', 'USERS.id')
                ->join('PLAYERS', 'USERS.id', '=', 'PLAYERS.user_id')
                ->where('COMMENTS.id', $commentId)
                ->select('COMMENTS.*', 'PLAYERS.user_name')
                ->first();


            DB::commit();


            return response()->json([
                'success' => true,
                'message' => 'Comentario creado exitosamente',
                'data' => $comment
            ], 201);


        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear comentario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el comentario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}




