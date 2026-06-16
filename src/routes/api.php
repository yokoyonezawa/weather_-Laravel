<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/weather', function (Request $request) {
    $apiKey = env('OPENWEATHER_API_KEY');

    if ($request->query('city')) {
        $city = $request->query('city');
        $url = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=ja&units=metric";
    } else {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        $url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=ja&units=metric";
    }

    $response = file_get_contents($url);

    return response($response, 200)->header('Content-Type', 'application/json');
});