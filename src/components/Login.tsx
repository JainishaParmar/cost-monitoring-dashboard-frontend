import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from './ErrorAlert';
import SuccessAlert from './SuccessAlert';
import FormField from './FormField';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Function to clear all form states
  const clearFormStates = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  // Function to switch to login mode
  const switchToLogin = () => {
    clearFormStates();
    setIsSignup(false);
  };

  // Function to switch to signup mode
  const switchToSignup = () => {
    clearFormStates();
    setIsSignup(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignup) {
        // Registration flow
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Registration failed');
        } else {
          setSuccess('Registration successful! Please log in.');
          setIsSignup(false);
        }
      } else {
        // Login flow
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'login');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {isSignup ? 'Create a new account' : 'Enter your credentials to access the dashboard'}
        </Typography>
        <ErrorAlert error={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
        <Box component="form" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isSignup ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={switchToLogin} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={switchToSignup} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign Up
              </button>
            </span>
          )}
        </div>
      </Paper>
    </Box>
  );
};

export default Login;
 