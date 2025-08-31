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
