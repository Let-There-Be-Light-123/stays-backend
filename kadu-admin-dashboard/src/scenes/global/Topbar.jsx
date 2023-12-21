import React, { useContext, useState } from "react";
import { Box, IconButton, useTheme, Popover, List, ListItem, ListItemText } from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {useNavigate} from 'react-router-dom';
import Config from "../../config/config";
import { useStateContext } from "../../contexts/ContextProvider";

const Topbar = () => {
  const { logout } = useStateContext(); // Import the logout function from the context
  const theme = useTheme();
  const navigate = useNavigate()
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
  
    if (isConfirmed) {
      logout();
      fetch(`${Config.BASE_URL}/api/logout`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`, // Include the authentication token in the headers
        },
      })
        .then((response) => {
          if (response.ok) {
            console.log("Logout successful");
            localStorage.removeItem('ACCESS_TOKEN');
            navigate('/login');
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleProfileClick}>
          <PersonOutlinedIcon />
        </IconButton>

        {/* Profile Dropdown */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <List>
            <ListItem button onClick={handleClose}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
            {/* Add more menu items as needed */}
          </List>
        </Popover>
      </Box>
    </Box>
  );
};

export default Topbar;
