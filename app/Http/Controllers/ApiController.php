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

    public function restoreBackup(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $filename = $request->input('filename');
        $targetDatabase = $request->input('target_database');
        $createNew = $request->input('create_new', false);
        $newDatabaseName = $request->input('new_database_name');

        if (!$filename) {
            return response()->json(['error' => 'Backup filename is required'], 400);
        }

        if ($createNew) {
            if (!$newDatabaseName) {
                return response()->json(['error' => 'New database name is required when creating new database'], 400);
            }
            $targetDatabase = $newDatabaseName;
        } else {
            if (!$targetDatabase) {
                return response()->json(['error' => 'Target database is required'], 400);
            }
        }

        $backupPath = storage_path('app/backups/' . $filename);
        
        if (!file_exists($backupPath)) {
            return response()->json(['error' => 'Backup file not found'], 404);
        }

        try {
            // Get database connection details
            $host = env('DB_HOST', 'localhost');
            $port = env('DB_PORT', '3306');
            $username = env('DB_USERNAME');
            $password = env('DB_PASSWORD');

            // Create new database if requested
            if ($createNew) {
                // Validate database name
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $newDatabaseName)) {
                    return response()->json(['error' => 'Database name can only contain letters, numbers, and underscores'], 400);
                }

                try {
                    DB::statement("CREATE DATABASE IF NOT EXISTS `{$newDatabaseName}`");
                } catch (\Exception $e) {
                    return response()->json(['error' => 'Failed to create new database: ' . $e->getMessage()], 500);
                }
            } else {
                // Check if target database exists
                $databases = DB::select('SHOW DATABASES');
                $dbExists = false;
                foreach ($databases as $db) {
                    if ($db->Database === $targetDatabase) {
                        $dbExists = true;
                        break;
                    }
                }
                
                if (!$dbExists) {
                    return response()->json(['error' => 'Target database does not exist'], 404);
                }
            }

            // Build mysql command for restoration
            $escapedPassword = escapeshellarg($password);
            $command = "mysql -h {$host} -P {$port} -u {$username} -p{$escapedPassword} \"{$targetDatabase}\" < \"{$backupPath}\" 2>&1";

            // Execute restoration command
            $output = shell_exec($command);

            // Check if restoration was successful (mysql returns empty output on success)
            if ($output === null || trim($output) === '') {
                $action = $createNew ? 'created and restored' : 'restored';
                return response()->json([
                    'success' => "Database '{$targetDatabase}' {$action} successfully from backup '{$filename}'! 🎉",
                    'databases' => $this->getFilteredDatabases()
                ]);
            } else {
                return response()->json(['error' => 'Restoration failed: ' . $output], 500);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Restoration failed: ' . $e->getMessage()], 500);
        }
    }

    public function cloneDatabase(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sourceDatabase = $request->input('source_database');
        $targetDatabase = $request->input('target_database');

        if (!$sourceDatabase || !$targetDatabase) {
            return response()->json(['error' => 'Source and target database names are required'], 400);
        }

        // Validate database names
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $targetDatabase)) {
            return response()->json(['error' => 'Target database name can only contain letters, numbers, and underscores'], 400);
        }

        try {
            // Check if source database exists and target doesn't exist
            $databases = DB::select('SHOW DATABASES');
            $sourceExists = false;
            $targetExists = false;
            
            foreach ($databases as $db) {
                if ($db->Database === $sourceDatabase) {
                    $sourceExists = true;
                }
                if ($db->Database === $targetDatabase) {
                    $targetExists = true;
                }
            }

            if (!$sourceExists) {
                return response()->json(['error' => 'Source database does not exist'], 404);
            }

            if ($targetExists) {
                return response()->json(['error' => 'Target database already exists'], 409);
            }

            // Create target database
            DB::statement("CREATE DATABASE `{$targetDatabase}`");

            // Get database connection details
            $host = env('DB_HOST', 'localhost');
            $port = env('DB_PORT', '3306');
            $username = env('DB_USERNAME');
            $password = env('DB_PASSWORD');

            // Create temporary backup file
            $tempBackupPath = storage_path('app/backups/temp_clone_' . time() . '.sql');

            // Escape password for shell command
            $escapedPassword = escapeshellarg($password);

            // Dump source database
            $dumpCommand = "mysqldump -h {$host} -P {$port} -u {$username} -p{$escapedPassword} --single-transaction --routines --triggers \"{$sourceDatabase}\" > \"{$tempBackupPath}\" 2>&1";
            $dumpOutput = shell_exec($dumpCommand);

            if (!file_exists($tempBackupPath) || filesize($tempBackupPath) == 0) {
                // Clean up target database if dump failed
                DB::statement("DROP DATABASE IF EXISTS `{$targetDatabase}`");
                return response()->json(['error' => 'Failed to dump source database: ' . $dumpOutput], 500);
            }

            // Restore to target database
            $restoreCommand = "mysql -h {$host} -P {$port} -u {$username} -p{$escapedPassword} \"{$targetDatabase}\" < \"{$tempBackupPath}\" 2>&1";
            $restoreOutput = shell_exec($restoreCommand);

            // Clean up temporary backup file
            if (file_exists($tempBackupPath)) {
                unlink($tempBackupPath);
            }

            // Check if restoration was successful
            if ($restoreOutput !== null && trim($restoreOutput) !== '') {
                // Clean up target database if restore failed
                DB::statement("DROP DATABASE IF EXISTS `{$targetDatabase}`");
                return response()->json(['error' => 'Failed to restore to target database: ' . $restoreOutput], 500);
            }

            return response()->json([
                'success' => "Database '{$sourceDatabase}' cloned to '{$targetDatabase}' successfully! 🎉",
                'databases' => $this->getFilteredDatabases()
            ]);

        } catch (\Exception $e) {
            // Clean up target database if it was created
            try {
                DB::statement("DROP DATABASE IF EXISTS `{$targetDatabase}`");
            } catch (\Exception $cleanupException) {
                // Ignore cleanup errors
            }
            
            return response()->json(['error' => 'Clone operation failed: ' . $e->getMessage()], 500);
        }
    }

    private function formatBytes($size, $precision = 2)
    {
        if ($size == 0) return '0 B';
        $base = log($size, 1024);
        $suffixes = array('B', 'KB', 'MB', 'GB', 'TB');
        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
    }

    public function getDatabaseTables(Request $request, $database)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Validate database name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
            return response()->json(['error' => 'Invalid database name'], 400);
        }

        try {
            // Check if database exists and is not a system database
            $allowedDatabases = $this->getFilteredDatabases();
            if (!in_array($database, $allowedDatabases)) {
                return response()->json(['error' => 'Database not found or not accessible'], 404);
            }

            $tables = DB::select("SELECT 
                TABLE_NAME as name,
                TABLE_TYPE as type,
                ENGINE as engine,
                TABLE_ROWS as row_count,
                DATA_LENGTH as data_length,
                INDEX_LENGTH as index_length,
                CREATE_TIME as created_at,
                UPDATE_TIME as updated_at
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ? 
                ORDER BY TABLE_NAME", [$database]);

            // Format the data
            $formattedTables = array_map(function($table) {
                return [
                    'name' => $table->name,
                    'type' => $table->type,
                    'engine' => $table->engine,
                    'row_count' => $table->row_count ?: 0,
                    'size' => $this->formatBytes(($table->data_length ?: 0) + ($table->index_length ?: 0)),
                    'created_at' => $table->created_at,
                    'updated_at' => $table->updated_at
                ];
            }, $tables);

            return response()->json([
                'success' => true,
                'database' => $database,
                'tables' => $formattedTables
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch tables: ' . $e->getMessage()], 500);
        }
    }

    public function getTableStructure(Request $request, $database, $table)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Validate names
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $database) || !preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
            return response()->json(['error' => 'Invalid database or table name'], 400);
        }

        try {
            // Check if database exists and is accessible
            $allowedDatabases = $this->getFilteredDatabases();
            if (!in_array($database, $allowedDatabases)) {
                return response()->json(['error' => 'Database not found or not accessible'], 404);
            }

            // Get table structure
            $columns = DB::select("SELECT 
                COLUMN_NAME as name,
                DATA_TYPE as type,
                IS_NULLABLE as nullable,
                COLUMN_DEFAULT as default_value,
                COLUMN_KEY as key_type,
                EXTRA as extra,
                COLUMN_COMMENT as comment
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION", [$database, $table]);

            // Get indexes
            $indexes = DB::select("SELECT 
                INDEX_NAME as name,
                COLUMN_NAME as column_name,
                NON_UNIQUE as non_unique,
                INDEX_TYPE as type
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY INDEX_NAME, SEQ_IN_INDEX", [$database, $table]);

            return response()->json([
                'success' => true,
                'database' => $database,
                'table' => $table,
                'columns' => $columns,
                'indexes' => $indexes
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch table structure: ' . $e->getMessage()], 500);
        }
    }

    public function getTableData(Request $request, $database, $table)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Validate names
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $database) || !preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
            return response()->json(['error' => 'Invalid database or table name'], 400);
        }

        $page = max(1, (int)$request->get('page', 1));
        $limit = min(100, max(10, (int)$request->get('limit', 50))); // Max 100 rows per page
        $offset = ($page - 1) * $limit;

        try {
            // Check if database exists and is accessible
            $allowedDatabases = $this->getFilteredDatabases();
            if (!in_array($database, $allowedDatabases)) {
                return response()->json(['error' => 'Database not found or not accessible'], 404);
            }

            // Switch to the target database temporarily
            $currentDb = env('DB_DATABASE');
            config(['database.connections.mysql.database' => $database]);
            DB::purge('mysql');

            // Get total count
            $totalCount = DB::selectOne("SELECT COUNT(*) as count FROM `{$table}`")->count;

            // Get data with pagination
            $data = DB::select("SELECT * FROM `{$table}` LIMIT {$limit} OFFSET {$offset}");

            // Convert to array for easier handling
            $rows = array_map(function($row) {
                return (array)$row;
            }, $data);

            // Switch back to original database
            config(['database.connections.mysql.database' => $currentDb]);
            DB::purge('mysql');

            return response()->json([
                'success' => true,
                'database' => $database,
                'table' => $table,
                'data' => $rows,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit)
                ]
            ]);
        } catch (\Exception $e) {
            // Make sure to switch back to original database on error
            config(['database.connections.mysql.database' => $currentDb ?? env('DB_DATABASE')]);
            DB::purge('mysql');
            
            return response()->json(['error' => 'Failed to fetch table data: ' . $e->getMessage()], 500);
        }
    }

    public function executeQuery(Request $request)
    {
        if (!$this->isAuthenticated($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'database' => 'required|string',
            'query' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Database and query are required'], 400);
        }

        $database = $request->input('database');
        $query = trim($request->input('query'));

        // Validate database name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
            return response()->json(['error' => 'Invalid database name'], 400);
        }

        // Check if database is accessible
        $allowedDatabases = $this->getFilteredDatabases();
        if (!in_array($database, $allowedDatabases)) {
            return response()->json(['error' => 'Database not found or not accessible'], 404);
        }

        // Security: Only allow SELECT queries and some safe SHOW/DESCRIBE commands
        $allowedPatterns = [
            '/^SELECT\s+/i',
            '/^SHOW\s+/i',
            '/^DESCRIBE\s+/i',
            '/^DESC\s+/i',
            '/^EXPLAIN\s+/i'
        ];

        $isAllowed = false;
        foreach ($allowedPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            return response()->json(['error' => 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed'], 400);
        }

        // Additional security: Check for dangerous keywords
        $dangerousKeywords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'REPLACE'];
        $upperQuery = strtoupper($query);
        foreach ($dangerousKeywords as $keyword) {
            if (strpos($upperQuery, $keyword) !== false) {
                return response()->json(['error' => 'Query contains forbidden keywords'], 400);
            }
        }

        try {
            $currentDb = env('DB_DATABASE');
            config(['database.connections.mysql.database' => $database]);
            DB::purge('mysql');

            $startTime = microtime(true);
            $results = DB::select($query);
            $executionTime = round((microtime(true) - $startTime) * 1000, 2); // milliseconds

            // Convert to array for easier handling
            $rows = array_map(function($row) {
                return (array)$row;
            }, $results);

            // Switch back to original database
            config(['database.connections.mysql.database' => $currentDb]);
            DB::purge('mysql');

            return response()->json([
                'success' => true,
                'database' => $database,
                'query' => $query,
                'results' => $rows,
                'row_count' => count($rows),
                'execution_time_ms' => $executionTime
            ]);
        } catch (\Exception $e) {
            // Switch back to original database on error
            config(['database.connections.mysql.database' => $currentDb ?? env('DB_DATABASE')]);
            DB::purge('mysql');
            
            return response()->json(['error' => 'Query execution failed: ' . $e->getMessage()], 500);
        }
    }

    public function generateAIContext(Request $request)
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

        // Validate database name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
            return response()->json(['error' => 'Invalid database name'], 400);
        }

        // Check if database is accessible
        $allowedDatabases = $this->getFilteredDatabases();
        if (!in_array($database, $allowedDatabases)) {
            return response()->json(['error' => 'Database not found or not accessible'], 404);
        }

        try {
            // Step 1: Get all tables
            $currentDb = env('DB_DATABASE');
            config(['database.connections.mysql.database' => $database]);
            DB::purge('mysql');

            $tables = DB::select("SELECT table_name, table_comment FROM information_schema.tables WHERE table_schema = ?", [$database]);

            if (empty($tables)) {
                config(['database.connections.mysql.database' => $currentDb]);
                DB::purge('mysql');
                return response()->json(['error' => 'No tables found in this database'], 404);
            }

            // Step 2: Gather metadata for each table
            $tablesMetadata = [];
            foreach ($tables as $tableInfo) {
                $tableName = $tableInfo->table_name;
                $tableComment = $tableInfo->table_comment ?? '';

                // A. Get CREATE TABLE statement
                $createTableResult = DB::select("SHOW CREATE TABLE `{$tableName}`");
                $createStatement = $createTableResult[0]->{'Create Table'} ?? '';

                // B. Get column metadata
                $columns = DB::select("SHOW FULL COLUMNS FROM `{$tableName}`");

                // C. Get sample data (limit 3 rows)
                $sampleData = DB::select("SELECT * FROM `{$tableName}` LIMIT 3");
                $sampleDataArray = array_map(function($row) {
                    return (array)$row;
                }, $sampleData);

                $tablesMetadata[] = [
                    'table_name' => $tableName,
                    'table_comment' => $tableComment,
                    'create_statement' => $createStatement,
                    'columns' => $columns,
                    'sample_data' => $sampleDataArray
                ];
            }

            // Switch back to original database
            config(['database.connections.mysql.database' => $currentDb]);
            DB::purge('mysql');

            // Step 3: Generate context from metadata
            $context = $this->generateContextFromMetadata($database, $tablesMetadata);

            return response()->json([
                'success' => true,
                'database' => $database,
                'context' => $context
            ]);

        } catch (\Exception $e) {
            // Switch back to original database on error
            config(['database.connections.mysql.database' => $currentDb ?? env('DB_DATABASE')]);
            DB::purge('mysql');

            return response()->json(['error' => 'Failed to generate AI context: ' . $e->getMessage()], 500);
        }
    }

    private function generateContextFromMetadata($database, $tablesMetadata)
    {
        $tables = [];

        foreach ($tablesMetadata as $tableInfo) {
            $tableName = $tableInfo['table_name'];
            $createStatement = $tableInfo['create_statement'];
            $columns = $tableInfo['columns'];
            $sampleData = $tableInfo['sample_data'];

            // Extract foreign key relationships from CREATE TABLE
            $relationships = [];
            if (preg_match_all('/FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)` \(`([^`]+)`\)/i', $createStatement, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $relationships[] = "FOREIGN KEY ({$match[1]}) REFERENCES {$match[2]}({$match[3]})";
                }
            }

            // Generate table description
            $tableDescription = $this->generateTableDescription($tableName, $tableInfo['table_comment'], $columns);

            // Process columns
            $processedColumns = [];
            foreach ($columns as $column) {
                $columnName = $column->Field;
                $columnType = $column->Type;
                $isNullable = strtoupper($column->Null) === 'YES';

                $processedColumns[] = [
                    'name' => $columnName,
                    'description' => $this->generateColumnDescription($columnName, $columnType, $column),
                    'synonyms' => $this->generateColumnSynonyms($columnName),
                    'type' => $columnType,
                    'nullable' => $isNullable
                ];
            }

            // Generate sample queries
            $sampleQueries = $this->generateSampleQueries($database, $tableName, $columns);

            $tables[] = [
                'name' => "{$database}.{$tableName}",
                'schema' => $createStatement,
                'description' => $tableDescription,
                'columns' => $processedColumns,
                'relationships' => $relationships,
                'sample_data' => $sampleData,
                'sample_queries' => $sampleQueries
            ];
        }

        return ['tables' => $tables];
    }

    private function generateTableDescription($tableName, $tableComment, $columns)
    {
        if (!empty($tableComment)) {
            return $tableComment;
        }

        // Generate description based on table name
        $words = preg_split('/[_-]/', $tableName);
        $words = array_map('ucfirst', $words);

        return "Stores " . strtolower(implode(' ', $words)) . " information with " . count($columns) . " columns.";
    }

    private function generateColumnDescription($columnName, $columnType, $column)
    {
        if (!empty($column->Comment)) {
            return $column->Comment;
        }

        // Generate description based on column name and type
        $name = str_replace('_', ' ', $columnName);

        if (stripos($columnName, 'id') !== false) {
            if ($columnName === 'id') {
                return "Unique identifier for this record";
            }
            return "Foreign key reference to " . str_replace('_id', '', $columnName);
        }

        if (stripos($columnName, 'name') !== false) {
            return "Name of the " . str_replace('_name', '', $columnName);
        }

        if (stripos($columnName, 'email') !== false) {
            return "Email address";
        }

        if (stripos($columnName, 'password') !== false) {
            return "Encrypted password";
        }

        if (stripos($columnName, 'created_at') !== false) {
            return "Timestamp when the record was created";
        }

        if (stripos($columnName, 'updated_at') !== false) {
            return "Timestamp when the record was last updated";
        }

        if (stripos($columnName, 'date') !== false) {
            return "Date value for " . str_replace('_date', '', $columnName);
        }

        if (stripos($columnName, 'status') !== false) {
            return "Current status";
        }

        if (stripos($columnName, 'type') !== false) {
            return "Type classification";
        }

        if (stripos($columnName, 'count') !== false || stripos($columnName, 'total') !== false) {
            return "Numeric count or total";
        }

        return "Stores " . $name . " data";
    }

    private function generateColumnSynonyms($columnName)
    {
        $synonyms = [];

        // Common synonyms
        $synonymMap = [
            'id' => ['identifier', 'key', 'primary_key'],
            'name' => ['title', 'label', 'description'],
            'email' => ['email_address', 'mail'],
            'phone' => ['telephone', 'phone_number', 'contact'],
            'address' => ['location', 'street_address'],
            'created_at' => ['created', 'creation_date', 'date_created'],
            'updated_at' => ['updated', 'modified', 'last_modified'],
            'deleted_at' => ['deleted', 'removed'],
            'status' => ['state', 'condition'],
            'type' => ['category', 'classification'],
            'description' => ['desc', 'details', 'notes'],
            'price' => ['cost', 'amount'],
            'quantity' => ['qty', 'amount', 'count'],
            'user_id' => ['user', 'owner_id', 'created_by']
        ];

        $lowerName = strtolower($columnName);

        foreach ($synonymMap as $key => $syns) {
            if (stripos($lowerName, $key) !== false) {
                $synonyms = array_merge($synonyms, $syns);
            }
        }

        // Add variations of the column name
        if (strpos($columnName, '_') !== false) {
            $parts = explode('_', $columnName);
            $camelCase = $parts[0] . implode('', array_map('ucfirst', array_slice($parts, 1)));
            $synonyms[] = $camelCase;
        }

        return array_unique(array_slice($synonyms, 0, 5));
    }

    private function generateSampleQueries($database, $tableName, $columns)
    {
        $queries = [];

        // Basic SELECT query
        $queries[] = [
            'query' => "SELECT * FROM `{$tableName}` LIMIT 10;",
            'intent' => "Retrieve the first 10 records from {$tableName}"
        ];

        // Find primary key
        $primaryKey = null;
        foreach ($columns as $column) {
            if ($column->Key === 'PRI') {
                $primaryKey = $column->Field;
                break;
            }
        }

        if ($primaryKey) {
            $queries[] = [
                'query' => "SELECT * FROM `{$tableName}` WHERE `{$primaryKey}` = 1;",
                'intent' => "Find a specific record by its {$primaryKey}"
            ];
        }

        // Look for common filter columns
        foreach ($columns as $column) {
            if (stripos($column->Field, 'status') !== false) {
                $queries[] = [
                    'query' => "SELECT * FROM `{$tableName}` WHERE `{$column->Field}` = 'active';",
                    'intent' => "Filter records by {$column->Field}"
                ];
                break;
            }
        }

        // COUNT query
        $queries[] = [
            'query' => "SELECT COUNT(*) as total FROM `{$tableName}`;",
            'intent' => "Count the total number of records in {$tableName}"
        ];

        return array_slice($queries, 0, 3);
    }
}
