<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class WebController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    public function welcome(Request $request){

        if(isset($request->pass)){
            $pass_string = $request->pass;
        }else{
            $pass_string = "";
        }
        
        $databases = $this->getDatabases();


        $pass_match = Hash::check($pass_string, env('SECRET_STRING'));

        return view("welcome", compact('databases', 'pass_match', 'pass_string'));
    }

    public function create_db(Request $request){
        $pass = $request->pass;
        $pass_match = Hash::check($pass, env('SECRET_STRING'));
        $pass_string = $pass;
        $databases = DB::select('SHOW DATABASES');

        if(!$pass_match){
            return view("welcome", compact('databases', 'pass_match', 'pass_string'));
        }

        //check if the database already exists
        $db_name = $request->db_name;
        $databases = array_map(function ($value) {
            return $value->Database;
        }, $databases);

        if(in_array($db_name, $databases)){
            $funny_message = "The database already exists, try another name 😢";
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message'));
        }


        $funny_message_success = "The database ". $db_name. " has been created, but you have to create the tables manually, sorry 😢, let\'s code 🚀!";


        $db_name = $request->db_name;
        DB::statement("CREATE DATABASE $db_name");
        $databases = $this->getDatabases();
        return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message_success'));
    }

    public function delete_db(Request $request){
        $pass = $request->pass;
        $pass_match = Hash::check($pass, env('SECRET_STRING'));
        $pass_string = $pass;
        $databases = DB::select('SHOW DATABASES');
    
        if(!$pass_match){
            return view("welcome", compact('databases', 'pass_match', 'pass_string'));
        }

        //check if the database already exists
        $db_name = $request->db_name;
        $databases = array_map(function ($value) {
            return $value->Database;
        }, $databases);

        if(!in_array($db_name, $databases)){
            $funny_message = "The database doesn't exists, try other name 😢";
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message'));
        }

        // if databese its from system, don't delete it
        if(in_array($db_name, ['information_schema', 'mysql', 'performance_schema', 'sys'])){
            $funny_message = "You can't delete this database, try other 😢";
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message'));
        }

        // delete the database
        DB::statement("DROP DATABASE $db_name");
        $funny_message_success = "The database ". $db_name ." has been deleted, now you can create a new one 😎";
        $databases = $this->getDatabases();
        return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message_success'));

    }

    private function getAllDatabases(){
        $databases = DB::select('SHOW DATABASES');
        //remove default databases, remeber that is an array of objects
        $databases = array_filter($databases, function ($value) {
            return !in_array($value->Database, ['information_schema', 'mysql', 'performance_schema', 'sys']);
        });
        //get only database names
        $databases = array_map(function ($value) {
            return $value->Database;
        }, $databases);
        return $databases;
    }

    private function getDatabases(){
        $databases = DB::select('SHOW DATABASES');
        //remove default databases, remeber that is an array of objects
        $databases = array_filter($databases, function ($value) {
            return !in_array($value->Database, ['information_schema', 'mysql', 'performance_schema', 'sys']);
        });
        //get only database names
        $databases = array_map(function ($value) {
            return $value->Database;
        }, $databases);
        return $databases;
    }
}
