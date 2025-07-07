import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from './ErrorAlert';
import SuccessAlert from './SuccessAlert';
import FormField from './FormField';
import './Login.css';

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
    <Box className="login-container">
      <Paper
        elevation={3}
        className="login-paper"
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" className="login-subtitle">
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
            className="login-submit-button"
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
        <div className="login-switch-container">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={switchToLogin} className="login-switch-button">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={switchToSignup} className="login-switch-button">
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
 