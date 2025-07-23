import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { Visibility, Edit, Delete, Refresh } from '@mui/icons-material';
import api from '../utils/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      throw new Error('Failed to load users');
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    try {
      const response = await api.get('/admin/submissions');
      setSubmissions(response.data);
    } catch (err) {
      throw new Error('Failed to load submissions');
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const response = await api.get('/admin/payments');
      setPayments(response.data);
    } catch (err) {
      throw new Error('Failed to load payments');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 0:
          await loadUsers();
          break;
        case 1:
          await loadSubmissions();
          break;
        case 2:
          await loadPayments();
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadUsers, loadSubmissions, loadPayments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleView = (item, type) => {
    setSelectedItem(item);
    setDialogType(`view_${type}`);
    setDialogOpen(true);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setDialogType(`edit_${type}`);
    setDialogOpen(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/admin/${type}/${id}`);
      loadData();
    } catch (err) {
      setError(`Failed to delete ${type}`);
    }
  };

  const handleSave = async () => {
    try {
      if (dialogType.startsWith('edit_')) {
        const type = dialogType.replace('edit_', '');
        await api.put(`/admin/${type}/${selectedItem.id}`, selectedItem);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const renderUsersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Registration Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name || 'N/A'}</TableCell>
              <TableCell>{user.state || 'N/A'}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip
                  label={user.is_active ? 'Active' : 'Inactive'}
                  color={user.is_active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleView(user, 'user')}
                  startIcon={<Visibility />}
                >
                  View
                </Button>
                <Button
                  size="small"
                  onClick={() => handleEdit(user, 'user')}
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(user.id, 'users')}
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSubmissionsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>User Email</TableCell>
            <TableCell>Form Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Tax Owed</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.id}</TableCell>
              <TableCell>{submission.user_email}</TableCell>
              <TableCell>{submission.form_type}</TableCell>
              <TableCell>
                <Chip
                  label={submission.status}
                  color={submission.status === 'submitted' ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>{new Date(submission.submission_date).toLocaleDateString()}</TableCell>
              <TableCell>${submission.tax_owed?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleView(submission, 'submission')}
                  startIcon={<Visibility />}
                >
                  View
                </Button>
                <Button
                  size="small"
                  onClick={() => handleEdit(submission, 'submission')}
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPaymentsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>User Email</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Payment Method</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment Date</TableCell>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.id}</TableCell>
              <TableCell>{payment.user_email}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>{payment.payment_method.toUpperCase()}</TableCell>
              <TableCell>
                <Chip
                  label={payment.status}
                  color={payment.status === 'completed' ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
              <TableCell>{payment.transaction_id}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleView(payment, 'payment')}
                  startIcon={<Visibility />}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDialog = () => {
    if (!selectedItem) return null;

    const isViewMode = dialogType.startsWith('view_');
    const title = isViewMode ? 'View Details' : 'Edit Item';

    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(selectedItem).map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, ' ').toUpperCase()}
                  value={value || ''}
                  disabled={isViewMode || key === 'id'}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    [key]: e.target.value
                  })}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave} variant="contained">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={loadData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
        >
          Refresh Data
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label={`Users (${users.length})`} />
            <Tab label={`Submissions (${submissions.length})`} />
            <Tab label={`Payments (${payments.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            renderUsersTable()
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            renderSubmissionsTable()
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            renderPaymentsTable()
          )}
        </TabPanel>
      </Card>

      {renderDialog()}
    </Box>
  );
}

export default AdminPanel;
