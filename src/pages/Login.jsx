import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleMfaRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      await api.post('/auth/mfa/request', { email, password: mfaCode });
      setStep(2);
      setMsg('MFA code sent (check logs or email in production).');
    } catch (err) {
      setError(err.response?.data?.detail || 'MFA request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api.post('/auth/token', `username=${encodeURIComponent(email)}&password=${encodeURIComponent(mfaCode)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setToken(res.data.access_token);
      setMsg('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            Login
          </Typography>
          {step === 1 ? (
            <form onSubmit={handleMfaRequest}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value)}
                margin="normal"
                required
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Request MFA'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label="MFA Code"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value)}
                margin="normal"
                required
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          )}
          {msg && <Alert severity="success" sx={{ mt: 2 }}>{msg}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
