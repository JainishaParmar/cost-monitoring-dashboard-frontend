import { InputAdornment, TextField, TextFieldProps, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

interface FormFieldProps extends Omit<TextFieldProps, 'type'> {
  showPasswordToggle?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

const FormField = ({ 
  showPasswordToggle = false,
  type = 'text',
  ...textFieldProps 
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const getFieldType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getInputProps = () => {
    if (type === 'password' && showPasswordToggle) {
      return {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      };
    }
    return textFieldProps.InputProps;
  };

  return (
    <TextField
      {...textFieldProps}
      type={getFieldType()}
      InputProps={getInputProps()}
      fullWidth
      margin="normal"
    />
  );
};

export default FormField;
 