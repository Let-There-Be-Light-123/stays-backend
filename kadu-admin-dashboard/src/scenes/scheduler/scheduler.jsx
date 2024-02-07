import React, { useState, useEffect } from "react";
import Timeline, { DateHeader, TimelineGroup, TimelineHeaders } from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import { useLocation } from 'react-router-dom';
import moment from "moment";
import FilterBox from "./filterbox";
import DataConvertHelper from "./dataconverterhelper.js";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import 'react-calendar-timeline/lib/Timeline.css'
import './timeline.css';
import Config from "../../config/config.js";
const TimelineRenderer = (props) => {
  const location = useLocation();
  const propertyDetails = location.state?.propertyDetails;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedGroups, updateSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {

    if (propertyDetails && propertyDetails.rooms) {
      console.log(propertyDetails);
      fetchPropertyBookings(propertyDetails.id);
      const processedGroups = propertyDetails.rooms.map(room => ({
        id: room.room_id,
        title: room.room_name
      }));
      setGroups(processedGroups);
    }
  }, [propertyDetails]);

  const fetchPropertyBookings = async (propertyId) => {
    try {
      const response = await fetch(`${Config.BASE_URL}/api/property/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ property_id: propertyId }),
      });
        if (!response.ok) {
        throw new Error('Failed to fetch property bookings');
      }
      const data = await response.json();
      const bookingItems = data.bookings.map((booking, index) => ({
        id: index + 1,
        group: booking.rooms[0],
        title: `Booking ${index + 1}`,
        start_time: moment(booking.check_in_date),
        end_time: moment(booking.check_out_date),
        style: { background: colors[index % colors.length] },
      }));
      console.log(bookingItems);
      setItems(bookingItems);
    } catch (error) {
      console.error('Error fetching property bookings:', error.message);
    }
  };
  // const items = [
  //   {
  //     id: 1,
  //     group: 1,
  //     title: 'Booking 1',
  //     start_time: moment('2024-01-25T08:00:00'),
  //     end_time: moment('2024-01-26T09:00:00'),
  //     style: { background: 'red' },
  //   },
  //   {
  //     id: 2,
  //     group: 2,
  //     title: 'Booking 2',
  //     start_time: moment('2024-01-24T14:00:00'),
  //     end_time: moment('2024-01-25T15:00:00'),
  //   },
  //   {
  //     id: 3,
  //     group: 1,
  //     title: 'Booking 3',
  //     start_time: moment('2024-01-27T10:00:00'),
  //     end_time: moment('2024-01-27T11:00:00'),
  //   },
  //   {
  //     id: 4,
  //     group: 2,
  //     title: 'Booking 4',
  //     start_time: moment('2024-01-26T18:00:00'),
  //     end_time: moment('2024-01-27T19:00:00'),
  //   },
  //   {
  //     id: 5,
  //     group: 1,
  //     title: 'Booking 5',
  //     start_time: moment('2024-01-23T12:00:00'),
  //     end_time: moment('2024-01-28T13:00:00'),
  //   },
  // ];

  const timeSteps={
    hour: 4,
    day: 1,
    month: 1,
    year: 1
  };
  


  const handleInputChange = (_event, newInput) => {
    updateSelectedGroups(newInput);
  };

  const mapRoomNames = () => {
    return groups.map((group) => group.title);
  };
  const handleItemClick = () => {

  };

  return (
    <div className="timeline-container" style={{ padding: "20px" }}>
      <Timeline
        lineHeight={60}
        sidebarWidth={250}
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(-12, 'hour')}
        defaultTimeEnd={moment().add(12, 'hour')}
        canMove={false}
        itemHeightRatio={0.8}
        onItemClick={handleItemClick}
        timeSteps={timeSteps}
        maxZoom={2 * 365.24 * 86400 * 1000}
        minZoom={6*60 * 60 * 1000}
        stackItems = {true}
      >
      </Timeline>
    </div>
  );

};



export default TimelineRenderer;