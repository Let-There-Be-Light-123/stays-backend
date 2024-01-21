import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Container, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Config from "../../config/config";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {getMessaging, getToken} from 'firebase/messaging';
import firebase from '../../firebase';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const LoginForm = ({ handleForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { token, setToken } = useStateContext();
  const { firebaseMessageToken,setFirebaseMessageToken } = useStateContext();
  const { user,setUser } = useStateContext();
  const [loginSuccessDialogOpen, setLoginSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('identifier', email);
      formData.append('password', password);
      
      const response = await fetch(`${Config.BASE_URL}/api/login`, {
        method: 'POST',
        body: formData,
        headers: {
        'Accept': 'application/json',
      },
      });

      if (!response.ok && response.status !== 200) {
        setSnackbarOpen({ open: true, message: `Login Failed: ${response.statusText}`, severity: 'error' });
        return;
      }

      const { token } = await response.json();
      setToken(token);
      fetchUserDetails(token);
      const fcmToken = await getFCMToken();
      if (!!!fcmToken) {
        setSnackbarOpen({ open: true, message: 'No fcm token recorded ', severity: 'error' });
        return;
      }
      const storeFCMTokenResponse = await storeFCMToken(fcmToken, token);
      if(!storeFCMTokenResponse) {
        setSnackbarOpen({ open: true, message: 'FCM Token Save Failed : ', severity: 'error' });
      }

      setLoginSuccessDialogOpen(true);
    } catch (error) {
      console.error('Login failed:', error);
      setSnackbarOpen({ open: true, message: 'Login Failed: ', severity: 'error' });
    }
  };

  const storeFCMToken = async (fcmToken, loginToken) => {
    if (!fcmToken) return false;
  
    try {
      const fcmStoreRequest = {
        remember_token: fcmToken
      };
  
      const response = await fetch(`${Config.BASE_URL}/api/store-fcm-token`, {
        method: 'POST',
        body: JSON.stringify(fcmStoreRequest),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginToken}`
        },
      });
  
      if (!response.ok) {

        const responseData = await response.json();
        const errorMessage = responseData.error || 'FCM Token Save Failed';
        
        console.error('FCM Token Save Failed:', errorMessage);
  
        setSnackbarOpen({ open: true, message: errorMessage, severity: 'error' });
  
        return false;
      }
  
      // Success case
      return true;
    } catch (error) {
      // Handle unexpected errors (e.g., network issues)
      console.error('An unexpected error occurred during FCM Token Save:', error);
  
      // Show a Snackbar with a generic error message
      setSnackbarOpen({ open: true, message: 'An unexpected error occurred during FCM Token Save.', severity: 'error' });
  
      return false;
    }
  };

  const getFCMToken = async () => {
    const messaging = getMessaging(firebase);

    try {
      const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VAPID_KEY });
      
      if (currentToken) {
        setFirebaseMessageToken(currentToken);
        setSnackbarOpen({ open: true, message: 'FCM Token Recorded.', severity: '' });
        return currentToken;
      } else {
        setSnackbarOpen({ open: true, message: 'Permission denied for notifications.', severity: 'error' });
        return false;
      }
    } catch (error) {
      setSnackbarOpen({ open: true, message: `'An error occurred while retrieving FCM token.', ${error}`, severity: 'error' });
    }
  };

  const fetchUserDetails = async (token) => {
    try {
      if (!token) {
        return;
      }
      const userDetailsResponse = await fetch(
        `${Config.BASE_URL}/api/userDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (userDetailsResponse.ok) {
        const userDetails = await userDetailsResponse.json();
        setUser(userDetails);
      } else {
        console.error("Failed to fetch user details:", userDetailsResponse);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleDialogClose = () => {
    setLoginSuccessDialogOpen(false);
    navigate('/');
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen({ open: false, message: '', severity: '' });
  };

  return (
    <Container component="main" maxWidth="xs" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ width: "100%", padding: "16px", borderRadius: "8px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}>
        <Typography component="h1" variant="h5" color='primary'>
          Sign in
        </Typography>
        <form style={{ marginTop: "16px" }} onSubmit={handleLogin}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            color='secondary'
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            color='secondary'
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleLogin}
            style={{ marginTop: "16px" }}
          >
            Sign In
          </Button>
          <Link component="button" variant="body2" onClick={handleForgotPassword} style={{ marginTop: "8px" }} color="secondary">
            Forgot password?
          </Link>
        </form>
      </div>

      <Dialog open={loginSuccessDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Login Successful</DialogTitle>
        <DialogContent>
          <Typography variant="body1">You have successfully logged in.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarOpen.severity} elevation={6} variant="filled">
          {snackbarOpen.message}
        </MuiAlert>
      </Snackbar>

    </Container>
  );
};

export default LoginForm;
