<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

// Debug route to check JWT configuration
$router->get('/debug/jwt', function () use ($router) {
    return response()->json([
        'jwt_secret' => config('jwt.secret'),
        'jwt_secret_length' => strlen(config('jwt.secret')),
        'jwt_secret_bits' => strlen(config('jwt.secret')) * 8,
        'env_jwt_secret' => env('JWT_SECRET'),
        'env_jwt_secret_key' => env('JWT_SECRET_KEY'),
    ]);
});

// API Routes
$router->group(['prefix' => 'api'], function () use ($router) {
    
    // Authentication Routes
    $router->post('register', 'AuthController@register');
    $router->post('login', 'AuthController@login');
    
    // Protected Routes
    $router->group(['middleware' => 'auth'], function () use ($router) {
        $router->get('me', 'AuthController@me');
        $router->post('logout', 'AuthController@logout');
        
        // Posts Routes
        $router->get('posts', 'PostController@index');
        $router->post('posts', 'PostController@store');
        $router->get('posts/{id}', 'PostController@show');
        $router->put('posts/{id}', 'PostController@update');
        $router->delete('posts/{id}', 'PostController@destroy');
    });
});
