<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()->favorites;
        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $city = $request->input('city');

        $exists = $request->user()->favorites()->where('city', $city)->exists();
        if ($exists) {
            return response()->json(['message' => 'すでに追加されています'], 409);
        }

        if ($request->user()->favorites()->count() >= 5) {
            return response()->json(['message' => 'お気に入りは5件までです'], 422);
        }

        $favorite = $request->user()->favorites()->create(['city' => $city]);
        return response()->json($favorite, 201);
    }

    public function destroy(Request $request, $city)
    {
        $request->user()->favorites()->where('city', $city)->delete();
        return response()->json(['message' => '削除しました']);
    }
}
