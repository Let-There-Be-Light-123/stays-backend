import React, { useState, useEffect } from "react";
import Timeline, { TimelineGroup } from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import FilterBox from "./filterbox";
import DataConvertHelper from "./dataconverterhelper.js";
import { tokens } from "../../theme";
import {  useTheme } from "@mui/material";
import "react-calendar-timeline/lib/Timeline.css";

const TimelineRenderer = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroups, updateSelectedGroups] = useState([]);  
  useEffect(() => {
    props.dataComponent
      .getData()
      .then((response) => {
        setGroups(
          DataConvertHelper.convertRoomsToTimelineGroups(response.rooms)
        );
        setItems(
          DataConvertHelper.convertBookingsToTimelineItems(
            response.bookings,
            response.rooms
          )
        );
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, [props.dataComponent]);

  const handleInputChange = (_event, newInput) => {
    updateSelectedGroups(newInput);
  };

  const mapRoomNames = () => {
    return groups.map((group) => group.title);
  };

  const getGroupsToShow = () => {
    return selectedGroups.length
      ? groups.filter((group) => selectedGroups.includes(group.title))
      : groups;
  };

  return isLoading ? (
    <div>"Loading Data..."</div>
  ) : (
    <div style={{padding: '20px', maxWidth:'85vw'}}>
      <div id="combo-box-container">
        <FilterBox
          roomNames={mapRoomNames()}
          onInputChange={handleInputChange}
          selectedGroups={selectedGroups}
        />
      </div>
      <div id="helper-text">
        <p>To zoom in and out, use CTRL + scroll</p>
      </div>
      <div>
      <Timeline
        groups={getGroupsToShow()}
        items={items}
        defaultTimeStart={moment("2023-01-01 00:00:00")}
        defaultTimeEnd={moment("2023-01-05 00:00:00")}
        lineHeight={100}
        timeSteps={{
          minute: 5,
          hour: 1,
          day: 1,
          month: 1,
          year: 1,
        }}
        maxZoom={30 * 86400 * 1000}
      />
      </div>
    </div>
  );
};



export default TimelineRenderer;