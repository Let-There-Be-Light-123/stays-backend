import React, { useState, useEffect } from "react";
import Timeline, { DateHeader, TimelineGroup, TimelineHeaders } from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import FilterBox from "./filterbox";
import DataConvertHelper from "./dataconverterhelper.js";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import 'react-calendar-timeline/lib/Timeline.css'
import './timeline.css';
const TimelineRenderer = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedGroups, updateSelectedGroups] = useState([]);
  const groups = [{ id: 1, title: 'Room 1' }, { id: 2, title: 'Room 2' }, { id: 3, title: 'Room 3' }, { id: 4, title: 'Room 4' }]

  const items = [
    {
      id: 1,
      group: 1,
      title: 'Booking 1',
      start_time: moment('2024-01-25T08:00:00'),
      end_time: moment('2024-01-26T09:00:00'),
      style: { background: 'red' },
    },
    {
      id: 2,
      group: 2,
      title: 'Booking 2',
      start_time: moment('2024-01-24T14:00:00'),
      end_time: moment('2024-01-25T15:00:00'),
    },
    {
      id: 3,
      group: 1,
      title: 'Booking 3',
      start_time: moment('2024-01-27T10:00:00'),
      end_time: moment('2024-01-27T11:00:00'),
    },
    {
      id: 4,
      group: 2,
      title: 'Booking 4',
      start_time: moment('2024-01-26T18:00:00'),
      end_time: moment('2024-01-27T19:00:00'),
    },
    {
      id: 5,
      group: 1,
      title: 'Booking 5',
      start_time: moment('2024-01-23T12:00:00'),
      end_time: moment('2024-01-28T13:00:00'),
    },
  ];

  const timeSteps={
    hour: 4,
    day: 1,
    month: 1,
    year: 1
  };
  

  itemRenderer: ({
    item,
    itemContext,
    getItemProps,
    getResizeProps
  }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    return (
      <div {...getItemProps(item.itemProps)}>
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}
  
        <div
          className="rct-item-content"
          style={{ maxHeight: `${itemContext.dimensions.height}` }}
        >
          {itemContext.title}
        </div>
  
        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
      </div>
    )};


  const handleInputChange = (_event, newInput) => {
    updateSelectedGroups(newInput);
  };

  const mapRoomNames = () => {
    return groups.map((group) => group.title);
  };
  const handleItemClick = () => {

  };

  const getGroupsToShow = () => {
    return selectedGroups.length
      ? groups.filter((group) => selectedGroups.includes(group.title))
      : groups;
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