import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await api.post('/auth/mfa/request', { email, password });
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
      const res = await api.post('/auth/token', 
        `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&mfa_code=${encodeURIComponent(mfaCode)}`, 
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
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
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                {loading ? <CircularProgress size={24} /> : 'Request MFA Code'}
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
                placeholder="Enter 6-digit code"
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
              <Button
                variant="text"
                fullWidth
                onClick={() => {
                  setStep(1);
                  setMfaCode('');
                  setError('');
                  setMsg('');
                }}
                sx={{ mt: 1 }}
              >
                Back to Login
              </Button>
            </form>
          )}

          {/* Register Link */}
          {step === 1 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="text" onClick={() => navigate('/register')}>
                Don't have an account? Register
              </Button>
            </Box>
          )}

          {msg && <Alert severity="success" sx={{ mt: 2 }}>{msg}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
