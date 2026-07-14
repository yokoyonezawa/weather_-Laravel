<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/weather', function (Request $request) {
    $apiKey = env('OPENWEATHER_API_KEY');

    if ($request->query('city')) {
        $city = $request->query('city');

        $geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" . urlencode($city) . "&limit=1&appid={$apiKey}";
        $geoResponse = file_get_contents($geoUrl);
        $geoData = json_decode($geoResponse, true);

        if (empty($geoData)) {
            return response()->json(['cod' => '404', 'message' => '都市が見つかりませんでした'], 200);
        }

        $lat = $geoData[0]['lat'];
        $lon = $geoData[0]['lon'];

        $url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=ja&units=metric";
    } else {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        $url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=ja&units=metric";
    }

    $response = file_get_contents($url);

    return response($response, 200)->header('Content-Type', 'application/json');
});

Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('/favorites', [App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/favorites', [App\Http\Controllers\FavoriteController::class, 'store']);
    Route::delete('/favorites/{city}', [App\Http\Controllers\FavoriteController::class, 'destroy']);
});
