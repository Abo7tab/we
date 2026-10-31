<?php

use App\Http\Controllers\NocUpdateController;
use Illuminate\Support\Facades\Route;

Route::get('/noc-updates', [NocUpdateController::class, 'index']);
Route::post('/noc-updates', [NocUpdateController::class, 'store'])->middleware('throttle:10,1');
Route::put('/noc-updates/{id}', [NocUpdateController::class, 'update'])->middleware('throttle:10,1');
Route::delete('/noc-updates/{id}', [NocUpdateController::class, 'destroy'])->middleware('throttle:10,1');
