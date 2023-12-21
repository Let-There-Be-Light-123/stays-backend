import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { mockAppUsers } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { tokens } from "../../theme.js";
import React, { useEffect, useState } from "react";
import Config from "../../config/config.js";
import { useParams, useNavigate } from 'react-router-dom';

const AppUsers = () => {
  const {userType} = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUserDetailsPopupOpen, setUserDetailsPopupOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({
    phone: "",
    role: "",
    isVerified: false,
    isActive: false,
  });
  const handleSelectionModelChange = (selectionModel) => {
    if (selectionModel.length > 0) {
      const selectedSocialSecurityNumbers = selectionModel.map(selection => users[selection-1].socialSecurityNumber);
      setSelectedUsers(selectedSocialSecurityNumbers);
    }
  };

  useEffect(() => {
    console.log("These are selected users", selectedUsers);
  }, [selectedUsers]);
  

  const handleCloseUserDetailsPopup = () => {
    setUserDetailsPopupOpen(false);
  };

  const handleRowClick = (params) => {
    setSelectedUserId(params.id);
    setUserDetailsPopupOpen(true);
  };
  const handleSaveChanges = () => {
    if (editedUser) {
      const userIdToUpdate = selectedUserId - 1; // Adjusted index
      const updatedUsers = [...users];
      const originalUser = updatedUsers[userIdToUpdate];
      const updatedUser = {
        ...originalUser,
        phone: editedUser.phone || originalUser.phone,
        role: editedUser.role || originalUser.role,
        isVerified: editedUser.isVerified !== undefined ? editedUser.isVerified : originalUser.isVerified,
        isActive: editedUser.isActive !== undefined ? editedUser.isActive : originalUser.isActive,
      };
      updatedUsers[userIdToUpdate] = updatedUser;
      setUsers(updatedUsers);
      const socialSecurity = originalUser.socialSecurityNumber;
      fetch(`${Config.BASE_URL}/api/users/${socialSecurity}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: updatedUser.phone,
          role_id: updatedUser.role,
          is_verified: updatedUser.isVerified,
          is_active: updatedUser.isActive,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('User updated successfully:', data);
          handleCloseUserDetailsPopup();
        })
        .catch(error => {
          console.error('Error updating user:', error);
        });
    }
  };
  const handleDeleteUser = () => {
    const socialSecurities = selectedUsers;
    fetch(`${Config.BASE_URL}/api/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ social_securities: socialSecurities }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error deleting users: ${response.statusText}`);
        }
        return response.json(); // Assuming the response contains JSON data
      })
      .then((data) => {
        console.log('Users deleted successfully:', data.deleted_users);
        // Add any additional handling as needed
      })
      .catch((error) => {
        console.error(error.message);
        // Add any error handling as needed
      });
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${Config.BASE_URL}/api/users`);
        const data = await response.json();
        let filteredUsers = data.users;
        if (userType === 'verified') {
          filteredUsers = data.users.filter(user => user.is_verified === 1);
        }
        else{
          filteredUsers = data.users.filter(user => user.is_verified === 0);
        }
        setUsers(filteredUsers.map((user, index) => ({
          id: index + 1,     
          socialSecurityNumber: user.social_security,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role_id,
          isVerified: user.is_verified
        })));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [userType]);
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    // { field: "registrarId", headerName: "Registrar ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
    },
    {
      field: "socialSecurityNumber",
      headerName: "Social Security Number",
      flex: 1,
    },
    {
      field: "role",
      headerName: "User Role",
      flex: 1,
    },
    {
      field: "isVerified",
      headerName: "Verified Status",
      flex: 1,
      renderCell: ({ row: { isVerified } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={isVerified ? colors.greenAccent[600] : colors.redAccent[700]}
            borderRadius="4px"
          >
            {isVerified ? (
              <AdminPanelSettingsOutlinedIcon />
            ) : (
              <LockOpenOutlinedIcon />
            )}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {isVerified ? "Verified" : "Not Verified"}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="APP USERS"
        subtitle={`${userType} User`}
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      > <Button variant="contained" color="secondary" onClick={handleDeleteUser}>
          Delete User
        </Button>
        <DataGrid
          rows={users}
          checkboxSelection
          columns={columns}
          onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={handleRowClick}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      <Dialog open={isUserDetailsPopupOpen} onClose={handleCloseUserDetailsPopup}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {/* Display user details here based on selectedUserId */}
          {selectedUserId && (
            <>
              <Typography>
                Name: {users[selectedUserId - 1].name} <br />
                Email: {users[selectedUserId - 1].email} <br />
                {/* Add other details as needed */}
              </Typography>
              <TextField
                label="New Phone"
                variant="outlined"
                fullWidth
                margin="normal"
                color="secondary"
                value={editedUser.phone}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              />
              <TextField
                label="New Role ID"
                variant="outlined"
                fullWidth
                margin="normal"
                color="secondary"
                value={editedUser.role}
                onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
              />
              {/* Toggle switch for Verified Status */}
              <FormControlLabel
                control={<Switch checked={editedUser.isVerified} color="secondary" onChange={(e) => setEditedUser({ ...editedUser, isVerified: e.target.checked })} />}
                label="Verified Status"
              />

              {/* Toggle switch for Active Status */}
              <FormControlLabel
                control={<Switch checked={editedUser.isActive} color="secondary"onChange={(e) => setEditedUser({ ...editedUser, isActive: e.target.checked })} />}
                label="Active Status"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Changes
          </Button>
          <Button onClick={handleCloseUserDetailsPopup} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppUsers;
