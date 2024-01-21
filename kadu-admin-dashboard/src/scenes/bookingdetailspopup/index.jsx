import React, { useState, useEffect, render  } from 'react';
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
import PdfGenerator from '../../services/pdfgenerator';
import { PDFDocument, rgb } from 'pdf-lib';
import html2canvas from 'html2canvas';
import BookingVoucher from './booking_voucher';
import { useReactToPrint } from 'react-to-print';

const BookingDetailsPopup = ({ open, handleClose, bookingDetails, onUpdateStatus }) => {
    const [newStatus, setNewStatus] = useState('');
    const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
    const componentRef = React.useRef();
    useEffect(() => {
        setCurrentBookingDetails(bookingDetails);
        console.log("Booking Details",bookingDetails);
        console.log("Current Booking Details", currentBookingDetails);
        setNewStatus(bookingDetails?.status || '');
    }, [bookingDetails]);

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

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    const handleDownloadPDF = () => {
        try {
            handlePrint();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };
    
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle style={{ fontSize: '24px' }}>Booking Details</DialogTitle>
            <DialogContent style={{ maxHeight: '80vh', overflowY: 'auto', fontSize: '18px' }}>
                {bookingDetails ? (
                    <>
                        <div style={{ fontSize: '20px' }}>
                            <strong>Booking Reference:</strong> {bookingDetails.bookingReference }
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
                                            </>
                                        )}
                                        <p style={{ fontSize: '18px' }}>Email: {guest && guest.email ? guest.email : ''}</p>
                                        <p style={{ fontSize: '18px' }}>Social Security: {guest && guest.socialSecurity ? guest.socialSecurity :''}</p>
                                        <p style={{ fontSize: '18px' }}>Phone: {guest && guest.phone ? guest.phone :''}</p>
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
                                <p style={{ fontSize: '18px' }}>Name: {bookingDetails.bookedBy.name && bookingDetails.bookedBy ? bookingDetails.bookedBy.name :''}</p>
                                <p style={{ fontSize: '18px' }}>Email: {bookingDetails.bookedBy.email &&  bookingDetails.bookedBy ?  bookingDetails.bookedBy.email : ''}</p>
                                <p style={{ fontSize: '18px' }}>Social Security: {bookingDetails.bookedBy.socialSecurity && bookingDetails.bookedBy ?  bookingDetails.bookedBy.socialSecurity :"" }</p>
                                <p style={{ fontSize: '18px' }}>Phone: {bookingDetails.bookedBy.phone && bookingDetails.bookedBy ? bookingDetails.bookedBy.phone :''}</p>
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        handleDownloadPDF();
                        setCurrentBookingDetails(bookingDetails);
                      }}
                    style={{ fontSize: '18px' }}
                >
                    Download PDF
                </Button>
            </DialogActions>
            <div style={{ display: 'none' }}>
                <BookingVoucher bookingDetails={bookingDetails} ref={componentRef} />
            </div>
        </Dialog>
    );
};

export default BookingDetailsPopup;
