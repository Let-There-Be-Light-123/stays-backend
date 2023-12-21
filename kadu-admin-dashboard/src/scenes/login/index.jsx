import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Container, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Config from "../../config/config";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const LoginForm = ({ handleForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { token, setToken } = useStateContext();
  const { setUserDetails } = useStateContext();
  const [loginSuccessDialogOpen, setLoginSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is already present, and navigate to '/' if true
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
      });

      if (!response.ok) {
        console.error('Login failed:', response);
        return;
      }

      const { token } = await response.json();
      setToken(token);
      fetchUserDetails(token);
      setLoginSuccessDialogOpen(true);
    } catch (error) {
      console.error('Login failed:', error);
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
        setUserDetails(userDetails.data);
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
    </Container>
  );
};

export default LoginForm;
