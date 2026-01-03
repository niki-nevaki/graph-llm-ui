import { Stack, TextField, Typography } from "@mui/material";
import type { CredentialFieldSchema } from "../../model/types";
import { SelectField } from "../fields/SelectField/SelectField";
import { ToggleField } from "../fields/ToggleField/ToggleField";
import { SecretField, type SecretFieldState } from "../fields/SecretField/SecretField";

type FieldRendererProps = {
  field: CredentialFieldSchema;
  value: unknown;
  error?: string;
  secretState?: SecretFieldState;
  onChange: (value: unknown) => void;
  onSecretChange?: (state: SecretFieldState) => void;
};

export function CredentialFieldRenderer({
  field,
  value,
  error,
  secretState,
  onChange,
  onSecretChange,
}: FieldRendererProps) {
  if (field.type === "password" || field.sensitive) {
    if (!secretState || !onSecretChange) {
      return null;
    }
    return (
      <SecretField
        label={field.label}
        description={field.description}
        required={field.required}
        error={Boolean(error)}
        helperText={error}
        state={secretState}
        onChange={onSecretChange}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <ToggleField
        label={field.label}
        value={Boolean(value)}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        label={field.label}
        value={String(value ?? "")}
        options={field.options ?? []}
        required={field.required}
        placeholder={field.placeholder}
        error={Boolean(error)}
        helperText={error}
        onChange={(next) => onChange(next)}
      />
    );
  }

  const isMultiline = field.type === "textarea" || field.ui?.multiline;

  return (
    <Stack spacing={0.5}>
      <TextField
        fullWidth
        label={field.label}
        value={value ?? ""}
        required={field.required}
        placeholder={field.placeholder}
        error={Boolean(error)}
        helperText={error}
        onChange={(event) => onChange(event.target.value)}
        multiline={isMultiline}
        minRows={isMultiline ? 3 : undefined}
        type={field.type === "number" ? "number" : "text"}
      />
      {field.description && (
        <Typography variant="caption" color="text.secondary">
          {field.description}
        </Typography>
      )}
    </Stack>
  );
}
