<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DecisionTreeController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/trees', [DecisionTreeController::class, 'index']);
Route::get('/trees/{tree}', [DecisionTreeController::class, 'show']);
