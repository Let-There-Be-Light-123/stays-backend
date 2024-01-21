import React from 'react';
import {  List } from 'react-virtualized';
import RoomList from './roomlist';
import DateHeader from './dataheader';
import BookingEvent from './bookingevent';
import AutoSizer from "react-virtualized-auto-sizer";

const sampleRooms = [
  { id: 1, name: 'Room A' },
  { id: 2, name: 'Room B' },
  { id: 3, name: 'Room C' },
];

const sampleDates = [
  new Date(2024, 0, 21),
  new Date(2024, 0, 22),
  new Date(2024, 0, 23),
];

const sampleBookings = [
  { id: 1, roomId: 1, date: new Date(2024, 0, 21), start: '9:00', end: '10:30' },
  { id: 2, roomId: 2, date: new Date(2024, 0, 22), start: '11:00', end: '12:00' },
  { id: 3, roomId: 3, date: new Date(2024, 0, 23), start: '14:00', end: '15:30' },
];

const TimelineCalendar = () => {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          width={width}
          height={height}
          rowCount={sampleDates.length}
          rowHeight={40}
          rowRenderer={({ index, key }) => (
            <div key={key}>
              <DateHeader date={sampleDates[index]} />
              {sampleRooms.map((room) => (
                <BookingEvent
                  key={room.id}
                  room={room}
                  bookings={sampleBookings.filter((b) => b.roomId === room.id && b.date === sampleDates[index])}
                />
              ))}
            </div>
          )}
        />
      )}
    </AutoSizer>
  );
};

export default TimelineCalendar;