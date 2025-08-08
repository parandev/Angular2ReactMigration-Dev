// DateRangePickerComponent.jsx
import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function DateRangePickerComponent() {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const [showCalendar, setShowCalendar] = useState(false);

  const handleRangeChange = (item) => {
    setRange([item.selection]);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setShowCalendar(!showCalendar)}
        style={{
          border: '1px solid #ccc',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '250px',
          backgroundColor: '#f5f5f5'
        }}
      >
        <span>
          {format(range[0].startDate, 'M/d/yyyy')} – {format(range[0].endDate, 'M/d/yyyy')}
        </span>
        <span style={{ float: 'right' }}>📅</span>
      </div>

      {showCalendar && (
        <div style={{ position: 'absolute', zIndex: 100 }}>
          <DateRange
            editableDateInputs={true}
            onChange={handleRangeChange}
            moveRangeOnFirstSelection={false}
            ranges={range}
            // maxDate={new Date()}
            // minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
          />
        </div>
      )}
    </div>
  );
}