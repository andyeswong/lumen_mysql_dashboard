import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Chip
} from '@mui/material';
import {
  Computer,
  Storage,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  DarkMode,
  LightMode,
  NetworkPing,
  Backup,
  Download,
  DeleteOutline,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import axios from 'axios';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [serverInfo, setServerInfo] = useState(null);
  const [newDbName, setNewDbName] = useState('');
  const [privilegeAddress, setPrivilegeAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, dbName: '' });
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [showBackups, setShowBackups] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState('');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#354f52',
      },
      secondary: {
        main: '#cad2c5',
      },
      background: {
        default: darkMode ? '#2f3e46' : '#ffffff',
        paper: darkMode ? '#354f52' : '#f5f5f5',
      },
      text: {
        primary: darkMode ? '#cad2c5' : '#2f3e46',
      },
    },
    typography: {
      fontFamily: '"IBM Plex Mono", monospace',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
  });

  const API_BASE = '/api';

  useEffect(() => {
    if (authenticated) {
      fetchDatabases();
      fetchBackups();
    }
  }, [authenticated]);

  const authenticate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth`, { password });
      if (response.data.authenticated) {
        setAuthenticated(true);
        setServerInfo(response.data.server_info);
        setMessage({ text: 'Authentication successful! 🎉', type: 'success' });
      } else {
        setMessage({ text: 'Wrong password 😢', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Authentication failed 😢', type: 'error' });
    }
    setLoading(false);
  };

  const fetchDatabases = async () => {
    try {
      const response = await axios.get(`${API_BASE}/databases`, {
        headers: { 'X-Password': password }
      });
      setDatabases(response.data.databases);
      setServerInfo(response.data.server_info);
    } catch (error) {
      setMessage({ text: 'Failed to fetch databases 😢', type: 'error' });
    }
  };

  const createDatabase = async () => {
    if (!newDbName.trim()) {
      setMessage({ text: 'Database name cannot be empty 😢', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/databases`, {
        db_name: newDbName,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      setDatabases(response.data.databases);
      setNewDbName('');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Failed to create database 😢', type: 'error' });
    }
    setLoading(false);
  };

  const deleteDatabase = async () => {
    if (confirmDeleteName !== deleteDialog.dbName) {
      setMessage({ text: 'Database name confirmation does not match 😢', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/databases`, {
        data: { db_name: deleteDialog.dbName, password }
      });
      setMessage({ text: response.data.success, type: 'success' });
      setDatabases(response.data.databases);
      setDeleteDialog({ open: false, dbName: '' });
      setConfirmDeleteName('');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Failed to delete database 😢', type: 'error' });
    }
    setLoading(false);
  };

  const flushPrivileges = async () => {
    if (!privilegeAddress.trim()) {
      setMessage({ text: 'Address cannot be empty 😢', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/privileges`, {
        address: privilegeAddress,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      setPrivilegeAddress('');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Failed to flush privileges 😢', type: 'error' });
    }
    setLoading(false);
  };

  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter') {
      action();
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/list-backups`, {
        headers: { 'X-Password': password }
      });
      if (response.data.success) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    }
  };

  const backupDatabase = async (database) => {
    if (!database) {
      setMessage({ text: 'Please select a database to backup 😢', type: 'error' });
      return;
    }

    setBackupLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/backup-database`, {
        database,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      fetchBackups(); // Refresh backup list
      setSelectedDatabase('');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Backup failed 😢', type: 'error' });
    }
    setBackupLoading(false);
  };

  const backupAllDatabases = async () => {
    setBackupLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/backup-all-databases`, {
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      fetchBackups(); // Refresh backup list
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Backup failed 😢', type: 'error' });
    }
    setBackupLoading(false);
  };

  const downloadBackup = async (filename) => {
    try {
      const response = await axios.post(`${API_BASE}/download-backup`, {
        filename,
        password
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ text: `Backup ${filename} downloaded successfully! 🎉`, type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to download backup 😢', type: 'error' });
    }
  };

  const deleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/delete-backup`, {
        filename,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      fetchBackups(); // Refresh backup list
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Failed to delete backup 😢', type: 'error' });
    }
  };

  if (!authenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Ent<strong>Dev</strong>_DBs<span style={{ animation: 'blink 1s infinite' }}>|</span>
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                🔐 Enter Password
              </Typography>
              <TextField
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, authenticate)}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={authenticate}
                disabled={loading}
                fullWidth
                size="large"
              >
                {loading ? 'Authenticating...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>
        </Container>
        <Snackbar
          open={!!message.text}
          autoHideDuration={4000}
          onClose={() => setMessage({ text: '', type: '' })}
        >
          <Alert severity={message.type} onClose={() => setMessage({ text: '', type: '' })}>
            {message.text}
          </Alert>
        </Snackbar>
        <style jsx>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Ent<strong>Dev</strong>_DBs<span style={{ animation: 'blink 1s infinite' }}>|</span>
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {/* Server Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ mr: 1 }} />
                  🖥️ Server Data
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>IP</strong></TableCell>
                        <TableCell>{serverInfo?.host}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Username</strong></TableCell>
                        <TableCell>{serverInfo?.username}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Password</strong></TableCell>
                        <TableCell>{serverInfo?.password}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Flush Privileges */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NetworkPing sx={{ mr: 1 }} />
                  🛜 Flush Privileges
                </Typography>
                <TextField
                  label="IP address or domain"
                  value={privilegeAddress}
                  onChange={(e) => setPrivilegeAddress(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, flushPrivileges)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={flushPrivileges}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Processing...' : 'Submit'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Databases */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage sx={{ mr: 1 }} />
                  💾 Databases
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 300 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Database</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {databases.map((db) => (
                        <TableRow key={db}>
                          <TableCell>{db}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, dbName: db })}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TextField
                  label="Database name"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, createDatabase)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={createDatabase}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Database Backups */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Backup sx={{ mr: 1 }} />
                    💾 Database Backups
                  </Typography>
                  <Box>
                    <Button
                      variant="contained" 
                      onClick={backupAllDatabases}
                      disabled={backupLoading}
                      sx={{ mr: 1 }}
                      startIcon={<Backup />}
                    >
                      {backupLoading ? 'Creating...' : 'Backup All'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowBackups(!showBackups)}
                      endIcon={showBackups ? <ExpandLess /> : <ExpandMore />}
                    >
                      {showBackups ? 'Hide' : 'Show'} Backups
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
                    <InputLabel>Select Database</InputLabel>
                    <Select
                      value={selectedDatabase}
                      label="Select Database"
                      onChange={(e) => setSelectedDatabase(e.target.value)}
                    >
                      {databases.map((db) => (
                        <MenuItem key={db} value={db}>
                          {db}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => backupDatabase(selectedDatabase)}
                    disabled={backupLoading || !selectedDatabase}
                    startIcon={<Backup />}
                  >
                    {backupLoading ? 'Creating...' : 'Backup Selected'}
                  </Button>
                </Box>

                <Collapse in={showBackups}>
                  <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    📦 Available Backups ({backups.length})
                  </Typography>
                  {backups.length > 0 ? (
                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Filename</strong></TableCell>
                            <TableCell><strong>Size</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {backups.map((backup, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip 
                                  label={backup.filename} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                />
                              </TableCell>
                              <TableCell>{backup.size}</TableCell>
                              <TableCell>{backup.created}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  color="primary"
                                  onClick={() => downloadBackup(backup.filename)}
                                  size="small"
                                  title="Download backup"
                                >
                                  <Download />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => deleteBackup(backup.filename)}
                                  size="small"
                                  title="Delete backup"
                                >
                                  <DeleteOutline />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No backups found. Create your first backup above! 🚀
                    </Typography>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, dbName: '' })}>
          <DialogTitle>
            To delete this database please type the name below: '{deleteDialog.dbName}'
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Database name"
              fullWidth
              variant="outlined"
              value={confirmDeleteName}
              onChange={(e) => setConfirmDeleteName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, dbName: '' })}>Cancel</Button>
            <Button
              onClick={deleteDatabase}
              color="error"
              disabled={confirmDeleteName !== deleteDialog.dbName || loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!message.text}
          autoHideDuration={4000}
          onClose={() => setMessage({ text: '', type: '' })}
        >
          <Alert severity={message.type} onClose={() => setMessage({ text: '', type: '' })}>
            {message.text}
          </Alert>
        </Snackbar>
      </Container>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </ThemeProvider>
  );
};

export default App;
