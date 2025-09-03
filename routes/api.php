<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the API routes for an application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

$router->group(['prefix' => 'api'], function () use ($router) {
    $router->post('/auth', 'ApiController@authenticate');
    $router->get('/databases', 'ApiController@getDatabases');
    $router->post('/databases', 'ApiController@createDatabase');
    $router->delete('/databases', 'ApiController@deleteDatabase');
    $router->post('/privileges', 'ApiController@flushPrivileges');
    
    // Backup routes
    $router->post('/backup-database', 'ApiController@backupDatabase');
    $router->post('/backup-all-databases', 'ApiController@backupAllDatabases');
    $router->get('/list-backups', 'ApiController@listBackups');
    $router->post('/download-backup', 'ApiController@downloadBackup');
    $router->post('/delete-backup', 'ApiController@deleteBackup');
    $router->post('/restore-backup', 'ApiController@restoreBackup');
    $router->post('/clone-database', 'ApiController@cloneDatabase');
    
    // Database browsing routes
    $router->get('/database/{database}/tables', 'ApiController@getDatabaseTables');
    $router->get('/database/{database}/table/{table}/structure', 'ApiController@getTableStructure');
    $router->get('/database/{database}/table/{table}/data', 'ApiController@getTableData');
    $router->post('/query', 'ApiController@executeQuery');
});
