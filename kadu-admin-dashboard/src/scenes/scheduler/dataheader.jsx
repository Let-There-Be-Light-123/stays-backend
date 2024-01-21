import React from 'react';
import moment from 'moment';

const sampleDate = new Date(2024, 0, 21);

const DateHeader = ({ date = sampleDate })=> {
  const formattedDate = moment(date).format('dddd, MMMM D, YYYY'); // Format the date

  return (
    <div>
      <h3>{formattedDate}</h3>
    </div>
  );
};

export default DateHeader;