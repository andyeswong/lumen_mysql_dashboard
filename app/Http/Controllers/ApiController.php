<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ApiController extends Controller
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

    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Password is required'], 400);
        }

        $pass_match = Hash::check($request->password, env('SECRET_STRING'));
        
        return response()->json([
            'authenticated' => $pass_match,
            'server_info' => $pass_match ? [
                'host' => env('DB_HOST'),
                'username' => env('DB_USERNAME'),
                'password' => env('DB_PASSWORD')
            ] : null
        ]);
    }

    public function getDatabases(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $databases = $this->getFilteredDatabases();
        
        return response()->json([
            'databases' => $databases,
            'server_info' => [
                'host' => env('DB_HOST'),
                'username' => env('DB_USERNAME'),
                'password' => env('DB_PASSWORD')
            ]
        ]);
    }

    public function createDatabase(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'db_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Database name is required'], 400);
        }

        $db_name = $request->db_name;

        // Validate database name
        if (empty($db_name) || strpos($db_name, '-') !== false) {
            return response()->json(['error' => "Database name cannot be empty or contain ' - ' 😢"], 400);
        }

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $db_name)) {
            return response()->json(['error' => 'No special characters or spaces allowed 😢'], 400);
        }

        // Check if database already exists
        $existing_databases = DB::select('SHOW DATABASES');
        $existing_names = array_map(function ($value) {
            return $value->Database;
        }, $existing_databases);

        if (in_array($db_name, $existing_names)) {
            return response()->json(['error' => 'The database already exists, try another name 😢'], 400);
        }

        try {
            DB::statement("CREATE DATABASE `$db_name`");
            $databases = $this->getFilteredDatabases();
            
            return response()->json([
                'success' => "The database $db_name has been created, but you have to create the tables manually, sorry 😢, let's code 🚀!",
                'databases' => $databases
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while creating the database 😢'], 500);
        }
    }

    public function deleteDatabase(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'db_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Database name is required'], 400);
        }

        $db_name = $request->db_name;

        // Check if database exists
        $existing_databases = DB::select('SHOW DATABASES');
        $existing_names = array_map(function ($value) {
            return $value->Database;
        }, $existing_databases);

        if (!in_array($db_name, $existing_names)) {
            return response()->json(['error' => "The database doesn't exist, try another name 😢"], 400);
        }

        // Protect system databases
        if (in_array($db_name, ['information_schema', 'mysql', 'performance_schema', 'sys'])) {
            return response()->json(['error' => "You can't delete this database, try another 😢"], 400);
        }

        try {
            DB::statement("DROP DATABASE `$db_name`");
            $databases = $this->getFilteredDatabases();
            
            return response()->json([
                'success' => "The database $db_name has been deleted, now you can create a new one 😎",
                'databases' => $databases
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the database 😢'], 500);
        }
    }

    public function flushPrivileges(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'address' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid address input'], 400);
        }

        $address = $request->address;

        $ipPattern = '/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/';
        $domainPattern = '/^(?!:\/\/)([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/';

        $isValidIp = preg_match($ipPattern, $address);
        $isValidDomain = preg_match($domainPattern, $address);

        if (!$isValidIp && !$isValidDomain) {
            return response()->json(['error' => 'Invalid IP address or domain'], 400);
        }

        $sanitizedAddress = $isValidIp ? filter_var($address, FILTER_VALIDATE_IP) : htmlspecialchars($address, ENT_QUOTES, 'UTF-8');

        try {
            DB::statement("GRANT ALL ON *.* TO '" . env('DB_USERNAME') . "'@'" . $sanitizedAddress . "' IDENTIFIED BY '" . env('DB_PASSWORD') . "' WITH GRANT OPTION;");
            DB::statement("FLUSH PRIVILEGES;");
            
            return response()->json([
                'success' => "The privileges have been flushed for the address $sanitizedAddress, now you can connect to the database 😎"
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred, please check the logs 😢'], 500);
        }
    }

    private function isAuthenticated(Request $request)
    {
        $password = $request->header('X-Password') ?? $request->password;
        return Hash::check($password, env('SECRET_STRING'));
    }

    private function getFilteredDatabases()
    {
        $databases = DB::select('SHOW DATABASES');
        $databases = array_filter($databases, function ($value) {
            return !in_array($value->Database, ['information_schema', 'mysql', 'performance_schema', 'sys']);
        });
        return array_values(array_map(function ($value) {
            return $value->Database;
        }, $databases));
    }

    public function backupDatabase(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'database' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Database name is required'], 400);
        }

        $database = $request->input('database');
        $timestamp = date('Y-m-d_H-i-s');
        $filename = "{$database}_backup_{$timestamp}.sql";
        $backupPath = storage_path("app/backups/{$filename}");
        
        // Create backups directory if it doesn't exist
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Build mysqldump command with proper escaping
        $host = env('DB_HOST');
        $port = env('DB_PORT', 3306);
        $username = env('DB_USERNAME');
        $password = env('DB_PASSWORD');

        // Remove quotes from database name if present
        $database = trim($database, '"');
        
        // Escape password for shell command
        $escapedPassword = escapeshellarg($password);
        $command = "mysqldump -h {$host} -P {$port} -u {$username} -p{$escapedPassword} --single-transaction --routines --triggers \"{$database}\" > {$backupPath} 2>&1";
        $output = shell_exec($command);
        
        // Check if backup file was created successfully
        if (file_exists($backupPath) && filesize($backupPath) > 0) {
            return response()->json([
                'success' => "Database '{$database}' backed up successfully! File: {$filename} (" . $this->formatBytes(filesize($backupPath)) . ")",
                'filename' => $filename,
                'path' => $backupPath,
                'size' => $this->formatBytes(filesize($backupPath))
            ]);
        } else {
            return response()->json([
                'error' => 'Backup failed: ' . $output
            ], 500);
        }
    }

    public function backupAllDatabases(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $timestamp = date('Y-m-d_H-i-s');
        $filename = "all_databases_backup_{$timestamp}.sql";
        $backupPath = storage_path("app/backups/{$filename}");
        
        // Create backups directory if it doesn't exist
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Build mysqldump command for all databases with proper escaping
        $host = env('DB_HOST');
        $port = env('DB_PORT', 3306);
        $username = env('DB_USERNAME');
        $password = env('DB_PASSWORD');

        // Escape password for shell command
        $escapedPassword = escapeshellarg($password);
        $command = "mysqldump -h {$host} -P {$port} -u {$username} -p{$escapedPassword} --single-transaction --routines --triggers --all-databases --ignore-table=mysql.event > {$backupPath} 2>&1";
        $output = shell_exec($command);
        
        // Check if backup file was created successfully
        if (file_exists($backupPath) && filesize($backupPath) > 0) {
            return response()->json([
                'success' => "All databases backed up successfully! File: {$filename} (" . $this->formatBytes(filesize($backupPath)) . ")",
                'filename' => $filename,
                'path' => $backupPath,
                'size' => $this->formatBytes(filesize($backupPath))
            ]);
        } else {
            return response()->json([
                'error' => 'Backup failed: ' . $output
            ], 500);
        }
    }

    public function listBackups(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $backupDir = storage_path('app/backups');
        $backups = [];
        
        if (is_dir($backupDir)) {
            $files = scandir($backupDir);
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                    $filePath = $backupDir . '/' . $file;
                    $backups[] = [
                        'filename' => $file,
                        'size' => $this->formatBytes(filesize($filePath)),
                        'created' => date('Y-m-d H:i:s', filemtime($filePath)),
                        'path' => $filePath
                    ];
                }
            }
            
            // Sort by creation time (newest first)
            usort($backups, function($a, $b) {
                return strtotime($b['created']) - strtotime($a['created']);
            });
        }
        
        return response()->json([
            'success' => true,
            'backups' => $backups
        ]);
    }

    public function downloadBackup(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Filename is required'], 400);
        }

        $filename = $request->input('filename');
        $backupPath = storage_path("app/backups/{$filename}");
        
        if (!file_exists($backupPath)) {
            return response()->json([
                'error' => 'Backup file not found'
            ], 404);
        }
        
        return response()->download($backupPath);
    }

    public function deleteBackup(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Filename is required'], 400);
        }

        $filename = $request->input('filename');
        $backupPath = storage_path("app/backups/{$filename}");
        
        if (!file_exists($backupPath)) {
            return response()->json([
                'error' => 'Backup file not found'
            ], 404);
        }
        
        if (unlink($backupPath)) {
            return response()->json([
                'success' => "Backup {$filename} deleted successfully!"
            ]);
        } else {
            return response()->json([
                'error' => 'Failed to delete backup file'
            ], 500);
        }
    }

    private function formatBytes($size, $precision = 2)
    {
        if ($size == 0) return '0 B';
        $base = log($size, 1024);
        $suffixes = array('B', 'KB', 'MB', 'GB', 'TB');
        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
    }
}
