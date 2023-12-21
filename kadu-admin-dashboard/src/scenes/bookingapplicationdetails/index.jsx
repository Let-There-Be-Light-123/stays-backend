import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Container,
  Grid,
} from '@mui/material';

const BookingApplicationDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const guestApplicationData = {
    bookingId: 1,
    checkInDate: '2023-12-01',
    checkOutDate: '2023-12-07',
    guests: [
      { id: 1, name: 'John Doe', phone: '123-456-7890', email: 'john@example.com', socialSecurity: '123-45-6789' },
      { id: 1, name: 'John Doe', phone: '123-456-7890', email: 'john@example.com', socialSecurity: '123-45-6789' },
    ],
    bookedBy: {
      userId: 101,
      userName: 'Sanskari Kumar',
      phone: '123-456-7890',
      email: 'sanskari@example.com',
      socialSecurity: '987-65-4321',
    },
    totalGuests: 1, // Update with the total number of guests
    roomDetails: {
      roomId: 201,
      roomName: 'Suite Room',
      // Add more room details as needed
    },
    propertyDetails: {
      propertyId: 301,
      propertyName: 'Luxury Villa',
    },
  };
  const [accepted, setAccepted] = useState(false);
  const handleSubmit = async () => {
    try {
      const apiUrl = `${Config.BASE_URL}/api/bookings/updateStatus`;
      const requestData = {
        bookingId: guestApplicationData.bookingId,
        status: 'booked',
      };
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      if (response.ok) {
        console.log('Application submitted successfully!');
      } else {
        console.error('Failed to submit application:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Guest Application Details - Booking ID: {bookingId}
        </Typography>
        <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Go Back
          </Button>
        </Grid>
          <Grid item xs={12}>
            {/* Display Guest Details */}
            <Typography variant="h6" gutterBottom>
              Guest Details:
            </Typography>
            {guestApplicationData.guests.map((guest) => (
              <div key={guest.id}>
                <Typography>
                  Name: {guest.name}, Phone: {guest.phone}, Email: {guest.email}, SSN: {guest.socialSecurity}
                </Typography>
              </div>
            ))}
          </Grid>
          <Grid item xs={12}>
            {/* Display Booking Details */}
            <Typography variant="h6" gutterBottom>
              Booking Details:
            </Typography>
            <Typography>
              Check-in Date: {guestApplicationData.checkInDate}, Check-out Date: {guestApplicationData.checkOutDate}
            </Typography>
            <Typography>
              Total Guests: {guestApplicationData.totalGuests}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* Display Booked By Details */}
            <Typography variant="h6" gutterBottom>
              Booked By:
            </Typography>
            <Typography>
              Name: {guestApplicationData.bookedBy.userName}, Phone: {guestApplicationData.bookedBy.phone}, Email: {guestApplicationData.bookedBy.email}, SSN: {guestApplicationData.bookedBy.socialSecurity}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* Display Room Details */}
            <Typography variant="h6" gutterBottom>
              Room Details:
            </Typography>
            <Typography>
              Room ID: {guestApplicationData.roomDetails.roomId}, Room Name: {guestApplicationData.roomDetails.roomName}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* Checkbox for Acceptance */}
            <FormControlLabel
             
              control={<Checkbox checked={accepted} onChange={() => setAccepted(!accepted)}  color="secondary"/>}
              label="I accept this guest application."
            />
          </Grid>
          <Grid item xs={12}>
            {/* Submit Button */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={!accepted}
            >
              Submit Application
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BookingApplicationDetails;
