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
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Tabs,
  Tab,
  TextareaAutosize,
  Pagination,
  TableSortLabel,
  Tooltip,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
  Accordion
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
  ExpandLess,
  Restore,
  FileCopy,
  Search,
  PlayArrow,
  ViewList,
  Schema,
  Code,
  TableView,
  Description
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
  const [restoreDialog, setRestoreDialog] = useState({ open: false, filename: '' });
  const [restoreMode, setRestoreMode] = useState('existing'); // 'existing' or 'new'
  const [targetDatabase, setTargetDatabase] = useState('');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [cloneDialog, setCloneDialog] = useState({ open: false });
  const [sourceCloneDatabase, setSourceCloneDatabase] = useState('');
  const [targetCloneDatabase, setTargetCloneDatabase] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  
  // Database browser states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBrowserDatabase, setSelectedBrowserDatabase] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableStructure, setTableStructure] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tablePagination, setTablePagination] = useState({ current_page: 1, per_page: 50, total: 0, total_pages: 0 });
  const [queryDatabase, setQueryDatabase] = useState('');
  const [queryText, setQueryText] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [browserLoading, setBrowserLoading] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#00e676' : '#1976d2', // Bright green for dark, blue for light
        dark: darkMode ? '#00c853' : '#1565c0',
        light: darkMode ? '#66ffa6' : '#42a5f5',
      },
      secondary: {
        main: darkMode ? '#ff4081' : '#dc004e', // Pink accent for dark, red for light
        dark: darkMode ? '#f50057' : '#9a0036',
        light: darkMode ? '#ff79b0' : '#ff5983',
      },
      background: {
        default: darkMode ? '#0a0a0a' : '#f8fafc', // Very dark vs light gray
        paper: darkMode ? '#1a1a1a' : '#ffffff', // Dark gray vs white
      },
      surface: darkMode ? '#252525' : '#f1f5f9',
      text: {
        primary: darkMode ? '#e8eaed' : '#1e293b', // Light gray vs dark slate
        secondary: darkMode ? '#9aa0a6' : '#64748b', // Medium gray
      },
      divider: darkMode ? '#3c4043' : '#e2e8f0',
      // Custom colors for better dark mode experience
      success: {
        main: darkMode ? '#4caf50' : '#2e7d32',
        light: darkMode ? '#81c784' : '#4caf50',
        dark: darkMode ? '#388e3c' : '#1b5e20',
      },
      error: {
        main: darkMode ? '#f44336' : '#d32f2f',
        light: darkMode ? '#ef5350' : '#ef5350',
        dark: darkMode ? '#c62828' : '#c62828',
      },
      warning: {
        main: darkMode ? '#ff9800' : '#ed6c02',
        light: darkMode ? '#ffb74d' : '#ff9800',
        dark: darkMode ? '#f57c00' : '#e65100',
      },
      info: {
        main: darkMode ? '#2196f3' : '#0288d1',
        light: darkMode ? '#64b5f6' : '#03a9f4',
        dark: darkMode ? '#1976d2' : '#01579b',
      },
    },
    typography: {
      fontFamily: '"IBM Plex Mono", "Roboto Mono", "Consolas", monospace',
      h4: {
        fontWeight: 600,
        color: darkMode ? '#e8eaed' : '#1e293b',
      },
      h6: {
        fontWeight: 600,
        color: darkMode ? '#e8eaed' : '#1e293b',
      },
      body1: {
        color: darkMode ? '#e8eaed' : '#334155',
      },
      body2: {
        color: darkMode ? '#9aa0a6' : '#64748b',
      },
    },
    components: {
      // Customize Material-UI components for better dark mode
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            border: darkMode ? '1px solid #3c4043' : '1px solid #e2e8f0',
            boxShadow: darkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#252525' : '#f8fafc',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? '#3c4043' : '#e2e8f0',
            color: darkMode ? '#e8eaed' : '#1e293b',
          },
          head: {
            backgroundColor: darkMode ? '#252525' : '#f8fafc',
            color: darkMode ? '#e8eaed' : '#1e293b',
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#3c4043' : '#e2e8f0',
            color: darkMode ? '#e8eaed' : '#1e293b',
          },
          filled: {
            backgroundColor: darkMode ? '#00e676' : '#1976d2',
            color: darkMode ? '#000000' : '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? '#252525' : '#ffffff',
              '& fieldset': {
                borderColor: darkMode ? '#3c4043' : '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? '#00e676' : '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#00e676' : '#1976d2',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? '#9aa0a6' : '#64748b',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            boxShadow: darkMode 
              ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: darkMode 
                ? '0 4px 8px rgba(0, 0, 0, 0.4)' 
                : '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            '&.MuiAlert-standardSuccess': {
              backgroundColor: darkMode ? '#1b5e20' : '#e8f5e8',
              color: darkMode ? '#4caf50' : '#2e7d32',
            },
            '&.MuiAlert-standardError': {
              backgroundColor: darkMode ? '#b71c1c' : '#ffebee',
              color: darkMode ? '#f44336' : '#c62828',
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: darkMode ? '#e65100' : '#fff3e0',
              color: darkMode ? '#ff9800' : '#ef6c00',
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: darkMode ? '#0d47a1' : '#e3f2fd',
              color: darkMode ? '#2196f3' : '#1976d2',
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            '&:before': {
              backgroundColor: darkMode ? '#3c4043' : '#e2e8f0',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: darkMode ? '#9aa0a6' : '#64748b',
            '&.Mui-selected': {
              color: darkMode ? '#00e676' : '#1976d2',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: darkMode ? '#00e676' : '#1976d2',
          },
        },
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
        setMessage({ text: 'Authentication successful! ', type: 'success' });
      } else {
        setMessage({ text: 'Wrong password ', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Authentication failed ', type: 'error' });
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
      setMessage({ text: 'Failed to fetch databases ', type: 'error' });
    }
  };

  const createDatabase = async () => {
    if (!newDbName.trim()) {
      setMessage({ text: 'Database name cannot be empty ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Failed to create database ', type: 'error' });
    }
    setLoading(false);
  };

  const deleteDatabase = async () => {
    if (confirmDeleteName !== deleteDialog.dbName) {
      setMessage({ text: 'Database name confirmation does not match ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Failed to delete database ', type: 'error' });
    }
    setLoading(false);
  };

  const flushPrivileges = async () => {
    if (!privilegeAddress.trim()) {
      setMessage({ text: 'Address cannot be empty ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Failed to flush privileges ', type: 'error' });
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
      setMessage({ text: 'Please select a database to backup ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Backup failed ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Backup failed ', type: 'error' });
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
      
      setMessage({ text: `Backup ${filename} downloaded successfully! `, type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to download backup ', type: 'error' });
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
      setMessage({ text: error.response?.data?.error || 'Failed to delete backup', type: 'error' });
    }
  };

  const restoreBackup = async () => {
    const isNewDatabase = restoreMode === 'new';
    const dbName = isNewDatabase ? newDatabaseName : targetDatabase;

    if (!dbName.trim()) {
      setMessage({ text: 'Please provide a database name ', type: 'error' });
      return;
    }

    setRestoreLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/restore-backup`, {
        filename: restoreDialog.filename,
        target_database: isNewDatabase ? null : targetDatabase,
        create_new: isNewDatabase,
        new_database_name: isNewDatabase ? newDatabaseName : null,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      if (response.data.databases) {
        setDatabases(response.data.databases);
      }
      setRestoreDialog({ open: false, filename: '' });
      setTargetDatabase('');
      setNewDatabaseName('');
      setRestoreMode('existing');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Restore failed ', type: 'error' });
    }
    setRestoreLoading(false);
  };

  const cloneDatabase = async () => {
    if (!sourceCloneDatabase || !targetCloneDatabase.trim()) {
      setMessage({ text: 'Please provide both source and target database names ', type: 'error' });
      return;
    }

    if (sourceCloneDatabase === targetCloneDatabase) {
      setMessage({ text: 'Source and target database names must be different ', type: 'error' });
      return;
    }

    setCloneLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/clone-database`, {
        source_database: sourceCloneDatabase,
        target_database: targetCloneDatabase,
        password
      });
      setMessage({ text: response.data.success, type: 'success' });
      if (response.data.databases) {
        setDatabases(response.data.databases);
      }
      setCloneDialog({ open: false });
      setSourceCloneDatabase('');
      setTargetCloneDatabase('');
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Clone failed ', type: 'error' });
    }
    setCloneLoading(false);
  };

  // Database browser functions
  const fetchTables = async (database) => {
    if (!database) return;
    
    setBrowserLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/database/${database}/tables`, {
        headers: { 'X-Password': password }
      });
      setTables(response.data.tables);
    } catch (error) {
      setMessage({ text: 'Failed to fetch tables ', type: 'error' });
    }
    setBrowserLoading(false);
  };

  const fetchTableStructure = async (database, table) => {
    if (!database || !table) return;
    
    setBrowserLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/database/${database}/table/${table}/structure`, {
        headers: { 'X-Password': password }
      });
      setTableStructure(response.data);
    } catch (error) {
      setMessage({ text: 'Failed to fetch table structure ', type: 'error' });
    }
    setBrowserLoading(false);
  };

  const fetchTableData = async (database, table, page = 1, limit = 50) => {
    if (!database || !table) return;
    
    setBrowserLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/database/${database}/table/${table}/data`, {
        headers: { 'X-Password': password },
        params: { page, limit }
      });
      setTableData(response.data.data);
      setTablePagination(response.data.pagination);
    } catch (error) {
      setMessage({ text: 'Failed to fetch table data ', type: 'error' });
    }
    setBrowserLoading(false);
  };

  const executeQuery = async () => {
    if (!queryDatabase || !queryText.trim()) {
      setMessage({ text: 'Please select a database and enter a query ', type: 'error' });
      return;
    }

    setQueryLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/query`, {
        database: queryDatabase,
        query: queryText,
        password
      });
      setQueryResults(response.data);
      setMessage({ text: `Query executed successfully! ${response.data.row_count} rows returned in ${response.data.execution_time_ms}ms `, type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Query execution failed ', type: 'error' });
      setQueryResults(null);
    }
    setQueryLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset states when switching tabs
    if (newValue === 1) { // Database Browser tab
      setSelectedTable('');
      setTableStructure(null);
      setTableData([]);
    } else if (newValue === 2) { // Query tab
      setQueryResults(null);
    }
  };

  const handleDatabaseSelect = (database) => {
    setSelectedBrowserDatabase(database);
    setSelectedTable('');
    setTableStructure(null);
    setTableData([]);
    fetchTables(database);
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    fetchTableStructure(selectedBrowserDatabase, table);
    fetchTableData(selectedBrowserDatabase, table);
  };

  const sampleQueries = [
    'SELECT * FROM table_name LIMIT 10',
    'SHOW TABLES',
    'DESCRIBE table_name',
    'SELECT COUNT(*) FROM table_name',
    'SHOW CREATE TABLE table_name',
    'SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()'
  ];

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
                Enter Password
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

        {/* Main Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<Storage />} label="Database Management" />
            <Tab icon={<Search />} label="Database Browser" />
            <Tab icon={<Code />} label="Query Interface" />
          </Tabs>
        </Card>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Server Info */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Computer sx={{ mr: 1 }} />
                     Server Data
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
                   Flush Privileges
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
                   Databases
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

          {/* Database Cloning */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileCopy sx={{ mr: 1 }} />
                     Clone Database
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setCloneDialog({ open: true })}
                    startIcon={<FileCopy />}
                  >
                    Clone Database
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create an exact copy of an existing database with all its data, structure, and objects.
                </Typography>
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
                     Database Backups
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
                     Available Backups ({backups.length})
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
                                  color="success"
                                  onClick={() => setRestoreDialog({ open: true, filename: backup.filename })}
                                  size="small"
                                  title="Restore backup"
                                >
                                  <Restore />
                                </IconButton>
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
                      No backups found. Create your first backup above! 
                    </Typography>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Database Browser Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ViewList sx={{ mr: 1 }} />
                     Select Database
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Database</InputLabel>
                    <Select
                      value={selectedBrowserDatabase}
                      label="Database"
                      onChange={(e) => handleDatabaseSelect(e.target.value)}
                    >
                      {databases.map((db) => (
                        <MenuItem key={db} value={db}>
                          {db}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedBrowserDatabase && (
                    <>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <TableView sx={{ mr: 1 }} />
                         Tables ({tables.length})
                      </Typography>
                      {browserLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Table</strong></TableCell>
                                <TableCell><strong>Rows</strong></TableCell>
                                <TableCell><strong>Size</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {tables.map((table) => (
                                <TableRow 
                                  key={table.name}
                                  hover
                                  sx={{ cursor: 'pointer' }}
                                  selected={selectedTable === table.name}
                                  onClick={() => handleTableSelect(table.name)}
                                >
                                  <TableCell>{table.name}</TableCell>
                                  <TableCell>{table.row_count?.toLocaleString() || '0'}</TableCell>
                                  <TableCell>{table.size}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              {selectedTable && (
                <Grid container spacing={2}>
                  {/* Table Structure */}
                  <Grid item xs={12}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schema sx={{ mr: 1 }} />
                           Table Structure: {selectedTable}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {tableStructure && (
                          <TableContainer component={Paper}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Column</strong></TableCell>
                                  <TableCell><strong>Type</strong></TableCell>
                                  <TableCell><strong>Null</strong></TableCell>
                                  <TableCell><strong>Key</strong></TableCell>
                                  <TableCell><strong>Default</strong></TableCell>
                                  <TableCell><strong>Extra</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableStructure.columns.map((column) => (
                                  <TableRow key={column.name}>
                                    <TableCell>
                                      <Chip 
                                        label={column.name} 
                                        size="small" 
                                        variant={column.key_type === 'PRI' ? 'filled' : 'outlined'}
                                        color={column.key_type === 'PRI' ? 'primary' : 'default'}
                                      />
                                    </TableCell>
                                    <TableCell>{column.type}</TableCell>
                                    <TableCell>{column.nullable}</TableCell>
                                    <TableCell>{column.key_type}</TableCell>
                                    <TableCell>{column.default_value || 'NULL'}</TableCell>
                                    <TableCell>{column.extra}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Table Data */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Description sx={{ mr: 1 }} />
                             Table Data
                          </Typography>
                          {tablePagination.total > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Showing {((tablePagination.current_page - 1) * tablePagination.per_page) + 1} - {Math.min(tablePagination.current_page * tablePagination.per_page, tablePagination.total)} of {tablePagination.total} rows
                            </Typography>
                          )}
                        </Box>

                        {browserLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                          </Box>
                        ) : tableData.length > 0 ? (
                          <>
                            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
                              <Table stickyHeader size="small">
                                <TableHead>
                                  <TableRow>
                                    {Object.keys(tableData[0] || {}).map((column) => (
                                      <TableCell key={column}>
                                        <strong>{column}</strong>
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {tableData.map((row, index) => (
                                    <TableRow key={index}>
                                      {Object.values(row).map((value, cellIndex) => (
                                        <TableCell key={cellIndex}>
                                          {value === null ? (
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                              NULL
                                            </Typography>
                                          ) : (
                                            String(value)
                                          )}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {tablePagination.total_pages > 1 && (
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                  count={tablePagination.total_pages}
                                  page={tablePagination.current_page}
                                  onChange={(event, page) => fetchTableData(selectedBrowserDatabase, selectedTable, page)}
                                  color="primary"
                                />
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                            No data found in this table
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {!selectedTable && selectedBrowserDatabase && (
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <TableView sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Select a table to view its structure and data
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {!selectedBrowserDatabase && (
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Storage sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Select a database to browse its tables
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {/* Query Interface Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Code sx={{ mr: 1 }} />
                     SQL Query
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Target Database</InputLabel>
                    <Select
                      value={queryDatabase}
                      label="Target Database"
                      onChange={(e) => setQueryDatabase(e.target.value)}
                    >
                      {databases.map((db) => (
                        <MenuItem key={db} value={db}>
                          {db}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="subtitle2" gutterBottom>
                    Query (Read-only)
                  </Typography>
                  <TextField
                    multiline
                    rows={8}
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Enter your SELECT query here..."
                    fullWidth
                    sx={{ mb: 2, fontFamily: 'monospace' }}
                  />

                  <Button
                    variant="contained"
                    onClick={executeQuery}
                    disabled={queryLoading || !queryDatabase || !queryText.trim()}
                    fullWidth
                    startIcon={queryLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                    sx={{ mb: 2 }}
                  >
                    {queryLoading ? 'Executing...' : 'Execute Query'}
                  </Button>

                  <Typography variant="subtitle2" gutterBottom>
                    Sample Queries
                  </Typography>
                  {sampleQueries.map((query, index) => (
                    <Chip
                      key={index}
                      label={query}
                      size="small"
                      variant="outlined"
                      sx={{ m: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}
                      onClick={() => setQueryText(query)}
                      clickable
                    />
                  ))}

                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: darkMode ? 'rgba(33, 150, 243, 0.1)' : 'info.light', 
                    border: darkMode ? '1px solid #2196f3' : 'none',
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color={darkMode ? '#64b5f6' : 'text.primary'}>
                      ℹ <strong>Security Note:</strong> Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed. This interface is read-only.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ViewList sx={{ mr: 1 }} />
                     Query Results
                  </Typography>

                  {queryResults ? (
                    <>
                      <Box sx={{ 
                        mb: 2, 
                        p: 2, 
                        bgcolor: darkMode ? 'rgba(76, 175, 80, 0.1)' : 'success.light', 
                        border: darkMode ? '1px solid #4caf50' : 'none',
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color={darkMode ? '#81c784' : 'text.primary'}>
                          ✓ Query executed successfully! {queryResults.row_count} rows returned in {queryResults.execution_time_ms}ms
                        </Typography>
                        <Typography 
                          variant="body2"  
                          sx={{ 
                            fontFamily: 'monospace', 
                            mt: 1,
                            color: darkMode ? '#e8eaed' : '#1e293b',
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                            p: 1,
                            borderRadius: 1
                          }}
                        >
                          {queryResults.query}
                        </Typography>
                      </Box>

                      {queryResults.results.length > 0 ? (
                        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                {Object.keys(queryResults.results[0]).map((column) => (
                                  <TableCell key={column}>
                                    <strong>{column}</strong>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {queryResults.results.map((row, index) => (
                                <TableRow key={index}>
                                  {Object.values(row).map((value, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                      {value === null ? (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                          NULL
                                        </Typography>
                                      ) : (
                                        String(value)
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                          Query executed successfully but returned no results
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <Code sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Select a database and run a query to see results here
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

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

        {/* Restore Backup Dialog */}
        <Dialog 
          open={restoreDialog.open} 
          onClose={() => {
            setRestoreDialog({ open: false, filename: '' });
            setRestoreMode('existing');
            setTargetDatabase('');
            setNewDatabaseName('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
             Restore Backup: {restoreDialog.filename}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Restore Mode</FormLabel>
                <RadioGroup
                  value={restoreMode}
                  onChange={(e) => setRestoreMode(e.target.value)}
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel 
                    value="existing" 
                    control={<Radio />} 
                    label="Restore to existing database" 
                  />
                  <FormControlLabel 
                    value="new" 
                    control={<Radio />} 
                    label="Create new database and restore" 
                  />
                </RadioGroup>
              </FormControl>

              {restoreMode === 'existing' ? (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Target Database</InputLabel>
                  <Select
                    value={targetDatabase}
                    label="Target Database"
                    onChange={(e) => setTargetDatabase(e.target.value)}
                  >
                    {databases.map((db) => (
                      <MenuItem key={db} value={db}>
                        {db}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  margin="normal"
                  label="New Database Name"
                  fullWidth
                  variant="outlined"
                  value={newDatabaseName}
                  onChange={(e) => setNewDatabaseName(e.target.value)}
                  helperText="Only letters, numbers, and underscores allowed"
                />
              )}

                                <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: darkMode ? 'rgba(255, 152, 0, 0.1)' : 'warning.light', 
                    border: darkMode ? '1px solid #ff9800' : 'none',
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color={darkMode ? '#ff9800' : 'text.primary'}>
                       <strong>Warning:</strong> This will {restoreMode === 'existing' ? 'overwrite all data in the target database' : 'create a new database'}. This action cannot be undone.
                    </Typography>
                  </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setRestoreDialog({ open: false, filename: '' });
                setRestoreMode('existing');
                setTargetDatabase('');
                setNewDatabaseName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={restoreBackup}
              color="success"
              variant="contained"
              disabled={restoreLoading || (restoreMode === 'existing' ? !targetDatabase : !newDatabaseName.trim())}
              startIcon={<Restore />}
            >
              {restoreLoading ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clone Database Dialog */}
        <Dialog 
          open={cloneDialog.open} 
          onClose={() => {
            setCloneDialog({ open: false });
            setSourceCloneDatabase('');
            setTargetCloneDatabase('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
             Clone Database
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Source Database</InputLabel>
                <Select
                  value={sourceCloneDatabase}
                  label="Source Database"
                  onChange={(e) => setSourceCloneDatabase(e.target.value)}
                >
                  {databases.map((db) => (
                    <MenuItem key={db} value={db}>
                      {db}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                label="Target Database Name"
                fullWidth
                variant="outlined"
                value={targetCloneDatabase}
                onChange={(e) => setTargetCloneDatabase(e.target.value)}
                helperText="Only letters, numbers, and underscores allowed"
              />

              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: darkMode ? 'rgba(33, 150, 243, 0.1)' : 'info.light', 
                border: darkMode ? '1px solid #2196f3' : 'none',
                borderRadius: 1 
              }}>
                <Typography variant="body2" color={darkMode ? '#64b5f6' : 'text.primary'}>
                  ℹ <strong>Info:</strong> This will create an exact copy of the source database including all data, tables, views, procedures, and triggers.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setCloneDialog({ open: false });
                setSourceCloneDatabase('');
                setTargetCloneDatabase('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={cloneDatabase}
              color="secondary"
              variant="contained"
              disabled={cloneLoading || !sourceCloneDatabase || !targetCloneDatabase.trim()}
              startIcon={<FileCopy />}
            >
              {cloneLoading ? 'Cloning...' : 'Clone'}
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
