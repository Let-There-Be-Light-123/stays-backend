import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import Config from '../../config/config';
const BookingDetailsPopup = ({ open, handleClose, bookingDetails, onUpdateStatus }) => {
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        setNewStatus();
    }, [open]);

    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };

    const handleSubmit = async () => {
        if (bookingDetails) {
            const apiUrl = `${Config.BASE_URL}/api/bookings/updateStatus`;
            const body = {
                booking_reference: bookingDetails.bookingReference,
                status: newStatus,
            };
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                if (response.ok) {
                    onUpdateStatus(bookingDetails.bookingReference, newStatus);
                    window.location.reload();
                    // handleClose();
                } 
                 else {
                    console.error('Failed to update status:', response.status);
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle style={{ fontSize: '24px' }}>Booking Details</DialogTitle>
            <DialogContent style={{ maxHeight: '80vh', overflowY: 'auto', fontSize: '18px' }}>
                {bookingDetails ? (
                    <>
                        <div style={{ fontSize: '20px' }}>
                            <strong>Booking Reference:</strong> {bookingDetails.bookingReference}
                        </div>
                        <div style={{ fontSize: '20px' }}>
                            <strong>Room Name:</strong> {bookingDetails.roomName}
                        </div>
                        <div style={{ fontSize: '20px' }}>
                            <strong>User Email:</strong> {bookingDetails.userEmail}
                        </div>
                        <h3 style={{ fontSize: '22px' }}>Guests:</h3>
                        <ul>
                            {bookingDetails.guests && Array.isArray(bookingDetails.guests)
                                ? bookingDetails.guests.map((guest, index) => (
                                    <li key={index}>
                                        {guest && guest.name && (
                                            <>
                                                <p style={{ fontSize: '18px' }}>Name: {guest.name}</p>
                                                {/* Other properties */}
                                            </>
                                        )}
                                        <p style={{ fontSize: '18px' }}>Email: {guest.email}</p>
                                        <p style={{ fontSize: '18px' }}>Social Security: {guest.socialSecurity}</p>
                                        <p style={{ fontSize: '18px' }}>Phone: {guest.phone}</p>
                                        {/* Include other guest details as needed */}
                                    </li>
                                ))
                                : 'No guests available'}
                        </ul>

                        <p style={{ fontSize: '18px' }}>Check-in Date: {bookingDetails.checkInDate.toString()}</p>
                        <p style={{ fontSize: '18px' }}>Check-out Date: {bookingDetails.checkOutDate.toString()}</p>
                        <p style={{ fontSize: '18px' }}>Status: {bookingDetails.status}</p>
                        <h3 style={{ fontSize: '22px' }}>Booked By:</h3>
                        {bookingDetails.bookedBy ? (
                            <>
                                <p style={{ fontSize: '18px' }}>Name: {bookingDetails.bookedBy.name}</p>
                                <p style={{ fontSize: '18px' }}>Email: {bookingDetails.bookedBy.email}</p>
                                <p style={{ fontSize: '18px' }}>Social Security: {bookingDetails.bookedBy.socialSecurity}</p>
                                <p style={{ fontSize: '18px' }}>Phone: {bookingDetails.bookedBy.phone}</p>
                            </>
                        ) : (
                            <p style={{ fontSize: '18px' }}>No booking details available</p>
                        )}
                        <div style={{ marginTop: 16 }}>
                            <FormControl fullWidth>
                                <InputLabel id="status-select-label" style={{ fontSize: '18px' }}>Change Status</InputLabel>
                                <Select
                                    color="secondary"
                                    labelId="status-select-label"
                                    id="status-select"
                                    value={bookingDetails.status}
                                    onChange={handleStatusChange}
                                >
                                    <MenuItem value={bookingDetails.status}>{bookingDetails.status}</MenuItem>
                                    <MenuItem value="booked">Confirmed</MenuItem>
                                    {/* <MenuItem value="pending">Pending</MenuItem> */}
                                    <MenuItem value="canceled">Canceled</MenuItem>
                                    {/* Add more status options as needed */}
                                </Select>
                            </FormControl>
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: '18px' }}>No booking details available</div>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="secondary" onClick={handleClose} style={{ fontSize: '18px' }}>
                    Close
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit} style={{ fontSize: '18px' }}>
                    Update Status
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingDetailsPopup;
