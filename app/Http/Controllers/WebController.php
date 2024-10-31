<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
        $pass_match = Hash::check($request->pass, env('SECRET_STRING'));
        $pass_string = $request->pass;
        $databases = DB::select('SHOW DATABASES');

        if(!$pass_match){
            return view("welcome", compact('databases', 'pass_match', 'pass_string'));
        }
        
        //check if the database already exists
        $db_name = $request->db_name;
        $databases = array_map(function ($value) {
            return $value->Database;
        }, $databases);

        if($db_name == "" || strpos($db_name, "-") !== false){
            $funny_message= "Database name cannot be empty or contain ' - '😢";
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message'));
        }

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
        $pass_match = Hash::check($request->pass, env('SECRET_STRING'));
        $pass_string = $request->pass;
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

    public function flushPrivileges(Request $request){
        $pass_match = Hash::check($request->pass, env('SECRET_STRING'));
        $pass_string = $request->pass;
        
        if(!$pass_match){
            return view("welcome", compact('databases', 'pass_match', 'pass_string'));
        }

        $validator = Validator::make($request->all(), [
            'address' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid address input.'], 400);
        }

        $validatedData = $validator->validate();
        $address = $validatedData['address'];

        $ipPattern = '/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/';
        $domainPattern = '/^(?!:\/\/)([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/';

        $isValidIp = preg_match($ipPattern, $address);
        $isValidDomain = preg_match($domainPattern, $address);

        if (!$isValidIp && !$isValidDomain) {
            return response()->json(['error' => 'Invalid IP address or domain.'], 400);
        }

        $sanitizedAddress = $isValidIp ? filter_var($address, FILTER_VALIDATE_IP) : htmlspecialchars($address, ENT_QUOTES, 'UTF-8');

        try {
            DB::statement("GRANT ALL ON *.* TO '".env('DB_USERNAME')."'@'".$sanitizedAddress."' IDENTIFIED BY '".env('DB_PASSWORD')."' WITH GRANT OPTION;");
            DB::statement("FLUSH PRIVILEGES;");
            $funny_message_success = "The privileges have been flushed for the address ".$sanitizedAddress.", now you can connect to the database 😎";
            
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message_success'));
        } catch(\Exception $e) {
            $funny_message = "An error occurred, please check the logs 😢";
            
            $databases = $this->getDatabases();
            return view("welcome", compact('databases', 'pass_match', 'pass_string', 'funny_message'));
        }
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
