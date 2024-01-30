import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { mockBookings } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
// import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
// import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
// import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { tokens } from "../../theme.js"
import React, { useState, useEffect } from "react";
import BookingDetailsPopup from '../bookingdetailspopup/index.jsx'; // Import the popup component
import Config from "../../config/config.js";
import { useParams } from "react-router-dom";
const Bookings = () => {
    const {status} = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetailsPopupOpen, setBookingDetailsPopupOpen] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const handleRowClick = (params) => {
        const clickedBookingReference = params.row.bookingReference;
        const filteredBooking = bookings.find(booking => booking.bookingReference === clickedBookingReference);
        if (filteredBooking) {
            setSelectedBooking(filteredBooking);
            setBookingDetailsPopupOpen(true);
          } else {
            console.warn("Booking not found for the clicked reference:", clickedBookingReference);
          }        
      };
      const handleSelectionModelChange = (selectionModel) => {
        if (selectionModel.length === 1) {
          setSelectedUserId(selectionModel[0]);
          setUserDetailsPopupOpen(true);
        }
      };
      const handleBookingUpdate = () => {
        setUpdateTrigger((prev) => prev + 1);
      };
      useEffect(() => {
        const fetchBookings = async () => {
          try {
            const response = await fetch(`${Config.BASE_URL}/api/bookings`);
            if (!response.ok) {
              throw new Error("Failed to fetch bookings data");
            }
            const data = await response.json();
            const currentDate = new Date();

            const filteredBookings = data.bookings.filter(booking => {
              if (booking.status === "booked") {
                const checkinDate = new Date(booking.check_in_date);
                if (checkinDate > currentDate) {
                  return true;
                } else if( Date(booking.check_out_date) < currentDate){
                    return true;
                }
              } else {
                return false;
              }
            });
            const mappedBookings = filteredBookings.map((booking, index) => ({
              id: index + 1,
              bookingReference: booking?.booking_reference,
              property: booking?.property,
              roomName: booking?.rooms[0],
              roomId: booking?.rooms[0], 
              userEmail: booking?.booked_by.email, // Assuming only one guest in the array
              socialSecurityNumber: booking.booked_by?.social_security, // Assuming the second guest's social_security
              checkInDate: new Date(booking?.check_in_date),
              checkOutDate: new Date(booking?.check_out_date),
              // files: booking.files,
              updatedAt: booking && booking.updated_at ? Date(booking.updated_at) :new Date,
              createdAt: booking && booking.created_at ? Date(booking.created_at) : new Date(),
              status: booking?.status,
              guests: booking?.guests.map(guest => ({
                name: guest?.name,
                email: guest?.email,
                socialSecurity: guest?.social_security,
                phone: guest?.phone,
                roleId: guest?.role_id,
                isVerified: guest?.is_verified,
                isActive: guest?.is_active,
                emailVerifiedAt: guest?.email_verified_at,
                addressId: guest?.address_id,
                createdAt: new Date(guest?.created_at),
                updatedAt: new Date(guest?.updated_at)
              })),
              bookedBy: {
                name: booking.booked_by?.name,
                email: booking.booked_by?.email,
                socialSecurity: booking.booked_by?.social_security,
                phone: booking.booked_by?.phone,
                roleId: booking.booked_by?.role_id,
                isVerified: booking.booked_by?.is_verified,
                isActive: booking.booked_by?.is_active,
                emailVerifiedAt: booking.booked_by?.email_verified_at,
                addressId: booking.booked_by?.address_id,
                createdAt: new Date(booking.booked_by?.created_at),
                updatedAt: new Date(booking.booked_by?.updated_at)
              },
              signatures: booking?.signatures
            }));
    
            setBookings(mappedBookings);
          } catch (error) {
            console.log(error.message);
          } finally {
            setLoading(false);
          }
        };
    
        fetchBookings();
      }, [status]);
    const columns = [
        { field: "id", headerName: "Index" },
        {
            field: "bookingReference",
            headerName: "Booking Reference",
            flex: 1,
            cellClassName: "name-column--cell",
        },
        {
            field: "roomName",
            headerName: "Room Name",
            flex: 1,
        },
        {
            field: "roomId",
            headerName: "Room Id",
            flex: 1,
        },
        {
            field: "userEmail",
            headerName: "Guest Email",
            flex: 1,
        },
        {
            field: "socialSecurityNumber",
            headerName: "Social Security Number",
            flex: 1,
        },
        {
            field: "status",
            headerName: "Booking Status",
            flex: 1,
        },
        {
            field: "checkInDate",
            headerName: "Check In Date",
            flex: 1
        },
        {
            field: "checkOutDate",
            headerName: "Check Out Date",
            flex: 1
        }
    ];

    return (
        <Box m="20px">
            <Header
                title="Bookings"
                subtitle="Booking Statuses"
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
            >
                <DataGrid
                    rows={bookings}
                    checkboxSelection
                    columns={columns}
                    onRowClick={handleRowClick}
                    onSelectionModelChange={handleSelectionModelChange}
                    components={{ Toolbar: GridToolbar }}
                />
                      {/* Render the BookingDetailsPopup component */}
                <BookingDetailsPopup
                    open={bookingDetailsPopupOpen}
                    handleClose={() => setBookingDetailsPopupOpen(false)}
                    bookingDetails={selectedBooking}
                    onUpdateStatus={handleBookingUpdate}
                />
            </Box>
        </Box>
    );
};

export default Bookings;
