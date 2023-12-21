import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme.js";
import BookingDetailsPopup from '../bookingdetailspopup/index.jsx'; // Import the popup component
import Config from "../../config/config.js";
import { useParams } from "react-router-dom";

const BookRooms = () => {
  const { status } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookRoomPopupOpen, setBookRoomPopupOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleRowClick = (params) => {
    const clickedRoomId = params.row.id;
    const filteredRoom = rooms.find((room) => room.id === clickedRoomId);
    if (filteredRoom) {
      setSelectedRoom(filteredRoom);
      setBookRoomPopupOpen(true);
    } else {
      console.warn("Room not found for the clicked ID:", clickedRoomId);
    }
  };

  const handleSelectionModelChange = (selectionModel) => {
    if (selectionModel.length === 1) {
      setSelectedRoom(selectionModel[0]);
      setBookRoomPopupOpen(true);
    }
  };

  const handleRoomBookingUpdate = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${Config.BASE_URL}/api/rooms`);
        if (!response.ok) {
          throw new Error("Failed to fetch rooms data");
        }
        const data = await response.json();
        const mappedRooms = data.rooms.map((room, index) => ({
          id: index + 1,
          roomName: room.name,
        }));
        setRooms(mappedRooms);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [status]);

  const columns = [
    { field: "id", headerName: "Index" },
    {
      field: "roomName",
      headerName: "Room Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
  ];

  return (
    <Box m="20px">
      <Header title="Book Rooms" subtitle="Admin Booking Page" />
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
      >
        <DataGrid
          rows={rooms}
          checkboxSelection
          columns={columns}
          onRowClick={handleRowClick}
          onSelectionModelChange={handleSelectionModelChange}
          components={{ Toolbar: GridToolbar }}
        />
        <BookRoomPopup
          open={bookRoomPopupOpen}
          handleClose={() => setBookRoomPopupOpen(false)}
          roomDetails={selectedRoom}
          onUpdateBooking={handleRoomBookingUpdate}
        />
      </Box>
    </Box>
  );
};

export default BookRooms;
