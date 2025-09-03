# Dark Mode Redesign Update

## What Changed

The dark mode color scheme has been completely redesigned for better visual appeal and accessibility:

### New Color Scheme

**Dark Mode:**
- **Background**: Very dark black (#0a0a0a) with cards in dark gray (#1a1a1a)
- **Primary Color**: Bright green (#00e676) for buttons and active elements
- **Secondary Color**: Pink accent (#ff4081) for highlights
- **Text**: Light gray (#e8eaed) for primary text, medium gray (#9aa0a6) for secondary
- **Borders**: Subtle dark gray (#3c4043) for better contrast

**Light Mode:**
- **Background**: Clean light gray (#f8fafc) with white cards
- **Primary Color**: Modern blue (#1976d2)
- **Secondary Color**: Deep red (#dc004e)
- **Text**: Dark slate (#1e293b) with medium gray (#64748b) for secondary text

### Component Improvements

1. **Enhanced Tables**: Better contrast and readability with proper header styling
2. **Improved Cards**: Subtle borders and shadows for depth
3. **Better Form Fields**: Focused states with theme-appropriate colors
4. **Status Indicators**: Color-coded alerts and notifications with proper contrast
5. **Interactive Elements**: Hover effects and visual feedback

### Accessibility Features

- **High Contrast**: WCAG AA compliant color combinations
- **Visual Hierarchy**: Clear distinction between UI elements
- **Focus Indicators**: Visible focus states for keyboard navigation
- **Readable Typography**: Improved font weights and colors

## To Apply Updates

### Method 1: Install Node.js and Build (Recommended)

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies and build
cd /var/www/landing
npm install
npm run build
```

### Method 2: Manual File Update (If Node.js not available)

If you can't install Node.js, you can manually update the existing compiled file:

```bash
# Backup current file
cp /var/www/landing/public/js/app.js /var/www/landing/public/js/app.js.backup

# The updated React code is in src/App.js
# You'll need to either:
# 1. Install Node.js to compile properly, OR
# 2. Use an external build service, OR  
# 3. Copy the compiled code from another environment
```

## Testing the New Theme

1. **Start the server**:
   ```bash
   cd /var/www/landing
   php -S localhost:8000 -t public
   ```

2. **Access the app**: Navigate to `http://localhost:8000`

3. **Toggle dark mode**: Click the sun/moon icon in the top right

4. **Test all components**:
   - Database management interface
   - Database browser tab
   - Query interface tab
   - All dialogs and forms

## Color Reference

### Dark Mode Palette
```css
Background: #0a0a0a
Cards: #1a1a1a
Surface: #252525
Primary: #00e676
Secondary: #ff4081
Text Primary: #e8eaed
Text Secondary: #9aa0a6
Borders: #3c4043
```

### Light Mode Palette
```css
Background: #f8fafc
Cards: #ffffff
Surface: #f1f5f9
Primary: #1976d2
Secondary: #dc004e
Text Primary: #1e293b
Text Secondary: #64748b
Borders: #e2e8f0
```

## Browser Compatibility

The new theme uses modern CSS features and should work on:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Performance Impact

- **Minimal**: Theme changes are CSS-only with no performance impact
- **Memory**: Slight increase due to additional component overrides
- **Load Time**: No noticeable difference in loading speed

## Troubleshooting

### Issue: Colors not updating
- **Solution**: Clear browser cache and hard refresh (Ctrl+F5)

### Issue: Some elements still use old colors  
- **Solution**: Ensure you've rebuilt the frontend after updating App.js

### Issue: Build fails
- **Solution**: Make sure Node.js 16+ and npm are installed, then run `npm install`

## Customization

To further customize colors, edit the theme object in `/var/www/landing/src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: darkMode ? '#your-dark-color' : '#your-light-color',
    },
    // ... other colors
  },
});
```

Then rebuild with `npm run build`.
