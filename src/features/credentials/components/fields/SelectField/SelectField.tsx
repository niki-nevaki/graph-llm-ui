import { MenuItem, TextField } from "@mui/material";

type Option = { label: string; value: string };

type SelectFieldProps = {
  label: string;
  value: string;
  options: Option[];
  required?: boolean;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  value,
  options,
  required,
  placeholder,
  error,
  helperText,
  onChange,
}: SelectFieldProps) {
  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value}
      required={required}
      error={error}
      helperText={helperText}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
