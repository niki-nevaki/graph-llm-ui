import { FormControlLabel, Switch } from "@mui/material";

type ToggleFieldProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function ToggleField({ label, value, onChange }: ToggleFieldProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      label={label}
    />
  );
}
