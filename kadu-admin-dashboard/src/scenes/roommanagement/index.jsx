import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Grid, Switch, Dialog,
  DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Config from '../../config/config';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const RoomManagement = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [unavailableRooms, setUnavailableRooms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [newRoom, setNewRoom] = useState({
    room_id: "",
    property_id: propertyId,
    room_name: "",
    is_active: false,
  });

  useEffect(() => {

    fetchRoomDetails();
  }, [propertyId]);

  const handleRowClick = (params) => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateRoom = () => {
    console.log('Updating Room Details:', selectedRoom);
    handleCloseDialog();
  };
  const handleSelectionModelChange = (params) => {
    if (params > 0) {
      const selectedRows = params.map((selection) => rooms[selection-1].roomNumber);
      setSelectedRoom(selectedRows);
    }
  };
  const columns = [
    { field: 'roomNumber', headerName: 'Room Number', flex: 0.5 },
    // { field: 'roomNumber', headerName: 'Room Number', flex: 1 },
    { field: 'roomName', headerName: 'Room Name', flex: 1 },
    {
      field: 'isActive',
      headerName: 'Active Status',
      flex: 1,
      renderCell: (params) => (
        <Switch
          color="secondary"
          checked={params.row.isActive || false}
          onChange={() => handleToggleActiveStatus(params.row.id)}
        />
      ),
    },
    { field: 'isBooked', headerName: 'Booking Status', flex: 1 },
  ];

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleToggleActiveStatus = (roomId) => {
    console.log(`Toggle Active Status for Room ID ${roomId}`);
  };

  const fetchRoomDetails = async () => {
    try {
      const roomsResponse = await fetch(`${Config.BASE_URL}/api/properties/${propertyId}/rooms`);
      if (!roomsResponse.ok) {
        console.error('Error fetching rooms:', roomsResponse.statusText);
        return;
      }
      const roomsData = await roomsResponse.json();

      // Ensure roomsData is an array
      if (!Array.isArray(roomsData)) {
        console.error('Invalid data format. Expected an array.');
        return;
      }

      const availableRoomsData = roomsData.filter(room => room.is_active);
      const unavailableRoomsData = roomsData.filter(room => !room.is_active);
      setRooms(roomsData.map((room, index) => ({
        id: index + 1,
        roomNumber: room.room_id,
        roomName: room.room_name,
        isActive: room.is_active,
        isBooked: room.bookings ? room.bookings.status : 'available' 
      })));
      setAvailableRooms(availableRoomsData);
      setUnavailableRooms(unavailableRoomsData);
    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleDeleteRooms = async () => {
    const selectedRoomIds = selectedRoom;
    if (selectedRoomIds.length === 0) {
      console.log('No rooms selected for deletion.');
      return;
    }
    try {
      const response = await fetch(`${Config.BASE_URL}/api/rooms`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_ids: selectedRoomIds,
        }),
      });
  
      if (!response.ok) {
        console.error('Error deleting rooms:', response.statusText);
        return;
      }
      const updatedRoomsData = await response.json();
      fetchRoomDetails();
      setRooms(updatedRoomsData);
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error deleting rooms:', error);
    }
  };
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  function generateRoomId(propertyId, roomDescription) {
    const truncatedPropertyId = propertyId.substring(0, 4); // Take only 4 letters from propertyId
    const sanitizedDescription = roomDescription.replace(/\s+/g, '_').substring(0, 5);
    const randomString = Math.random().toString(36).substring(2, 8);
    const randomComponent = Math.random().toString(36).substring(2, 5);
    const roomId = `${randomString}_${truncatedPropertyId}_${sanitizedDescription}_${randomComponent}`.substring(0, 16);
    return roomId;
  }

  const handleCreateRoom = async () => {
    try {
      const room_id = generateRoomId(propertyId, newRoom.room_description);
      const response = await fetch(`${Config.BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newRoom,
          room_id,
        }),
      });
      if (!response.ok) {
        console.error('Error creating room:', response.statusText);
        throw new Error('Failed to create room');
      }
      fetchRoomDetails();
      const updatedRoomsData = await response.json();
      setRooms(updatedRoomsData);
      handleCloseAddDialog();
      
      setSnackbarSeverity('success');
      setSnackbarMessage('Room created successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error creating room:', error);
      
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to create room');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box m="20px">
      <Header title="TOTAL ROOMS" subtitle="List of Total Rooms" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          
        </Grid>
        <Grid item xs={12} container justifyContent="flex-end" spacing={2}>
          <Grid item>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Go Back
          </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
              Add Rooms
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={handleDeleteRooms}>
              Delete Rooms
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-row": {
            height: "100px",
            cursor: "pointer",
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
      >
        <DataGrid
          rows={rooms}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          onRowSelectionModelChange={handleSelectionModelChange}
          selectionModel={selectionModel}
          checkboxSelection
          onRowClick={handleRowClick}
        />
      </Box>
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          <Box mb={6}>
            <TextField
              color="secondary"
              label="Room Description"
              value={newRoom.room_description}
              fullWidth
              onChange={(e) => setNewRoom({ ...newRoom, room_description: e.target.value })}
            />
          </Box>
          <Box mb={6}>
            <TextField
              color="secondary"
              label="Room Name"
              value={newRoom.room_name}
              fullWidth
              onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
            />
          </Box>
          <Box mb={6}>
            <label>Active Status</label>
            <Switch
              color="secondary"
              checked={newRoom.is_active}
              onChange={(e) => setNewRoom({ ...newRoom, is_active: e.target.checked })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateRoom} color="secondary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          {/* Add form fields for editing room details */}
          <TextField
            color="secondary"
            label="Room Name"
            value={selectedRoom?.roomName || ''}
            fullWidth
            onChange={(e) => setSelectedRoom({ ...selectedRoom, roomName: e.target.value })}
          />
          <TextField
            color="secondary"
            label="Room Description"
            value={selectedRoom?.roomDescription || ''}
            fullWidth
            onChange={(e) => setSelectedRoom({ ...selectedRoom, roomDescription: e.target.value })}
          />
          <Box mb={6}>
            <label>Active Status</label>
            <Switch
              color="secondary"
              checked={selectedRoom?.isActive || false}
              onChange={() => setSelectedRoom({ ...selectedRoom, isActive: !selectedRoom?.isActive })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateRoom} color="secondary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default RoomManagement;