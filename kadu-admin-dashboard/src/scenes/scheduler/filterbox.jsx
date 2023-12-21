import React from "react";
import { TextField, Autocomplete } from "@mui/material";

const FilterBox = (props) => {
  return (
    <Autocomplete
      multiple={true}
      value={props.selectedGroups}
      id="combo-box"
      options={props.roomNames} // Updated to roomNames
      getOptionLabel={(option) => option}
      filterSelectedOptions
      style={{ width: 400 }}
      onChange={props.onInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Room filter" // Updated to Room filter
          variant="outlined"
          placeholder="Filter for as many rooms as you want" // Updated placeholder
        />
      )}
    />
  );
};

export default FilterBox;