import React from 'react';

const sampleBookings = [
  { id: 1, roomId: 1, date: new Date(2024, 0, 21), start: '9:00', end: '10:30' },
  { id: 2, roomId: 2, date: new Date(2024, 0, 22), start: '11:00', end: '12:00' },
  { id: 3, roomId: 3, date: new Date(2024, 0, 23), start: '14:00', end: '15:30' },
];

const BookingEvent = ({ room, booking = sampleBookings[0] }) => {
  return (
    <div className="booking-event">
      <h4>{room.name}</h4>
      <p>{booking.start} - {booking.end}</p>
    </div>
  );
};

export default BookingEvent;