import { TextField } from '@mui/material';
import React from 'react';

const InputField = ({ name, label, value, onChange, ...props }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      value={value}
      name={name}
      onChange={onChange}
      {...props}
      InputProps={{
        style: {
          fontWeight: 600,
          fontFamily: "'Roboto Slab', serif",
        },
      }}
      InputLabelProps={{
        style: { fontFamily: "'Roboto Slab', serif" },
      }}
      sx={{ mt: 2 }}
    />
  );
};

export default InputField;
