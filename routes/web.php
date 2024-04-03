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

$router->get('/',"WebController@welcome");
$router->post('/',"WebController@create_db");
$router->delete('/',"WebController@delete_db");
$router->post('/privileges',"WebController@flushPrivileges");