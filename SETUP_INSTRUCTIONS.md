# Database Browser & Query Interface Setup

This document provides instructions for setting up the enhanced MySQL dashboard with database browsing and query functionality.

## Prerequisites

### 1. Install Node.js and npm
```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Fix PHP MySQL Extensions
```bash
# Install required PHP extensions
sudo apt install php8.1-mysql php8.1-mysqli

# Restart web services
sudo systemctl restart apache2
# OR if using php-fpm:
sudo systemctl restart php8.1-fpm
```

## Installation Steps

### 1. Install Frontend Dependencies
```bash
cd /var/www/landing
npm install
```

### 2. Build Frontend
```bash
# For production
npm run build

# For development (with watch)
npm run watch

# For development server
npm run dev
```

### 3. Fix Authentication (if needed)
If authentication is not working, generate a new password hash:

```bash
# Generate hash for your password (replace 'your_password' with actual password)
php -r "echo password_hash('your_password', PASSWORD_DEFAULT);"
```

Then update the `SECRET_STRING` in your `.env` file with the generated hash.

### 4. Set Proper Permissions
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/landing/storage
sudo chown -R www-data:www-data /var/www/landing/public

# Set permissions
sudo chmod -R 755 /var/www/landing/storage
sudo chmod -R 755 /var/www/landing/public
```

## New Features

### Database Browser
- **Tab 2: Database Browser**
- Browse all accessible databases
- View table lists with row counts and sizes
- Inspect table structure (columns, indexes, keys)
- Browse table data with pagination (up to 100 rows per page)
- Visual indicators for primary keys and data types

### Query Interface  
- **Tab 3: Query Interface**
- Execute read-only queries safely
- Support for SELECT, SHOW, DESCRIBE, EXPLAIN commands
- Security filters prevent dangerous operations
- Query execution timing and row count display
- Sample queries for quick testing
- Syntax highlighting-ready interface

## Security Features

### Read-Only Queries
- Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries allowed
- Automatic filtering of dangerous keywords (DELETE, UPDATE, INSERT, etc.)
- Database access limited to non-system databases
- Input validation and sanitization

### Authentication
- All new endpoints require same authentication as existing features
- Password-based access control maintained
- Session-based authentication through headers

## API Endpoints

The following new endpoints have been added:

```
GET  /api/database/{database}/tables
GET  /api/database/{database}/table/{table}/structure  
GET  /api/database/{database}/table/{table}/data?page=1&limit=50
POST /api/query
```

## Usage Examples

### Browse Database Tables
1. Go to "Database Browser" tab
2. Select a database from dropdown
3. View table list with statistics
4. Click any table to see structure and data

### Run Queries
1. Go to "Query Interface" tab  
2. Select target database
3. Enter your SELECT query
4. Click "Execute Query"
5. View results in formatted table

### Sample Queries
```sql
-- List all tables
SHOW TABLES

-- Describe table structure
DESCRIBE table_name

-- Get sample data
SELECT * FROM table_name LIMIT 10

-- Count records
SELECT COUNT(*) FROM table_name

-- Get table schema info
SELECT COLUMN_NAME, DATA_TYPE 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
```

## Troubleshooting

### Issue: "Failed to fetch tables"
- Check PHP MySQL extensions are installed
- Verify database connectivity
- Ensure proper authentication

### Issue: "Query execution failed"
- Verify query syntax
- Check if database exists and is accessible
- Ensure query is read-only (SELECT, SHOW, etc.)

### Issue: Frontend not updating
- Run `npm run build` to recompile
- Clear browser cache
- Check JavaScript console for errors

## Performance Considerations

- Table data is paginated (max 100 rows per page)
- Large queries may take time to execute
- Query execution time is displayed for optimization
- Table structure cached until tab change

## Development

### File Structure
```
src/App.js              # Main React component with new tabs
routes/api.php           # New API endpoints
app/Http/Controllers/ApiController.php  # New controller methods
```

### Key Components
- **Database Browser**: Interactive table and structure viewer
- **Query Interface**: SQL query execution with safety checks  
- **Table Viewer**: Paginated data display with formatting
- **Security Layer**: Input validation and query filtering
