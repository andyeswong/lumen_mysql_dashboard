# Lumen MySQL Dashboard - React Frontend

This project has been converted from a traditional Blade-based frontend to a modern React application with Material-UI components.

## Features

- **Modern React UI**: Built with Material-UI components for a polished, professional look
- **Dark/Light Theme Toggle**: Users can switch between dark and light modes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Enhanced UX**: Improved form validation, loading states, and user feedback
- **Same Functionality**: All original features maintained:
  - Password-protected access
  - Create/delete MySQL databases
  - Flush MySQL privileges for IP addresses or domains
  - View server connection details

## Architecture

### Backend (API-only)
- **Framework**: Laravel Lumen 10
- **API Endpoints**:
  - `POST /api/auth` - Authentication
  - `GET /api/databases` - List databases
  - `POST /api/databases` - Create database
  - `DELETE /api/databases` - Delete database
  - `POST /api/privileges` - Flush privileges
- **CORS**: Enabled for cross-origin requests
- **Authentication**: Hash-based password verification with X-Password header

### Frontend (React + Material-UI)
- **Framework**: React 18
- **UI Library**: Material-UI v5
- **Styling**: Emotion (CSS-in-JS)
- **HTTP Client**: Axios
- **Build Tool**: Webpack 5
- **Font**: IBM Plex Mono (maintaining terminal aesthetic)

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   # PHP dependencies (if not already installed)
   composer install
   
   # Node.js dependencies
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   # Copy and configure environment file
   cp .env.example .env
   
   # Set your database credentials and SECRET_STRING
   # SECRET_STRING should be a hashed password for access
   ```

3. **Build Frontend**:
   ```bash
   # Production build
   npm run build
   
   # Development build with watch
   npm run watch
   
   # Development server (optional)
   npm run dev
   ```

4. **Start Lumen Server**:
   ```bash
   php -S localhost:8000 -t public
   ```

## Development

- **Frontend Development**: Use `npm run watch` to automatically rebuild on changes
- **API Testing**: Backend API is available at `/api/*` endpoints
- **Theme Customization**: Modify theme colors in `src/App.js`
- **Component Structure**: Main application logic is in `src/App.js`

## Migration Notes

- **Backend**: Converted `WebController` to `ApiController` with JSON responses
- **Routes**: Web routes now serve React app, API routes handle data operations
- **Authentication**: Changed from form-based to header-based authentication
- **CORS**: Added middleware for cross-origin requests
- **UI**: Maintained original color scheme and branding while modernizing components

## Color Scheme

- **Primary**: #354f52 (Dark green)
- **Secondary**: #cad2c5 (Light green)
- **Background**: #2f3e46 (Dark) / #ffffff (Light)
- **Text**: #cad2c5 (Dark) / #2f3e46 (Light)

## Security Features

- Password protection with hash verification
- Input validation and sanitization
- CSRF protection through API design
- Protection against system database deletion
- IP address and domain validation for privilege flushing
