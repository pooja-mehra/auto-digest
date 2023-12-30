import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const DateRangePickerComponent = (props) => {
  const [selection, setSelection] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const handleSelect = (ranges) => {
    // ranges will contain start date and end date
    props.setDateRange(ranges.selection)
    setSelection(ranges.selection);
  };

  return (
    <div>
      <DateRangePicker
        ranges={[selection]}
        onChange={handleSelect}
        rangeColors={['#3e82f7']} // Set the color of the selected range
      />
      <p>
        Selected Range: {selection.startDate.toDateString()} - {selection.endDate.toDateString()}
      </p>
    </div>
  );
};

export default DateRangePickerComponent;
