import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type {
  CredentialFieldMeta,
  CredentialPayload,
  CredentialTypeDefinition,
} from "../../model/types";
import { sortFields } from "../../model/schema";
import { CredentialFieldRenderer } from "./CredentialFieldRenderer";
import type { SecretFieldState } from "../fields/SecretField/SecretField";
import { TestCredentialPanel } from "../TestCredentialPanel/TestCredentialPanel";
import { isApiError } from "../../api/types";

export type CredentialFormValues = {
  name: string;
  data: Record<string, unknown>;
  dataMeta?: Record<string, CredentialFieldMeta>;
};

type CredentialEditorFormProps = {
  mode: "create" | "edit";
  typeDefinition: CredentialTypeDefinition;
  initialValues?: CredentialFormValues;
  onSubmit: (payload: CredentialPayload) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  saving?: boolean;
};

export function CredentialEditorForm({
  mode,
  typeDefinition,
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
  saving,
}: CredentialEditorFormProps) {
  const [name, setName] = useState("");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [secretStates, setSecretStates] = useState<
    Record<string, SecretFieldState>
  >({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const sortedFields = useMemo(
    () => sortFields(typeDefinition.fields),
    [typeDefinition]
  );

  useEffect(() => {
    const nextData: Record<string, unknown> = {};
    const nextSecrets: Record<string, SecretFieldState> = {};

    sortedFields.forEach((field) => {
      const initialValue = initialValues?.data?.[field.name];
      if (field.type === "password" || field.sensitive) {
        const initialMeta = initialValues?.dataMeta?.[field.name];
        const initialIsSet = initialMeta?.isSet ?? Boolean(initialValue);
        nextSecrets[field.name] = {
          value: "",
          isSet: initialIsSet,
          isEditing: !initialIsSet,
          initialIsSet,
        };
      } else {
        if (initialValue !== undefined) {
          nextData[field.name] = initialValue;
        } else if (field.default !== undefined) {
          nextData[field.name] = field.default;
        } else if (field.type === "boolean") {
          nextData[field.name] = false;
        } else {
          nextData[field.name] = "";
        }
      }
    });

    setName(initialValues?.name ?? "");
    setData(nextData);
    setSecretStates(nextSecrets);
    setFieldErrors({});
    setFormError(null);
  }, [initialValues, sortedFields]);

  const buildPayload = (): CredentialPayload => {
    const payloadData: Record<string, unknown> = { ...data };
    const dataMeta: Record<string, CredentialFieldMeta> = {};

    Object.entries(secretStates).forEach(([fieldName, state]) => {
      if (state.isEditing) {
        payloadData[fieldName] = state.value;
        dataMeta[fieldName] = { isSet: state.value.length > 0 };
      } else {
        payloadData[fieldName] = undefined;
        dataMeta[fieldName] = { isSet: state.isSet };
      }
    });

    return {
      name: name.trim(),
      type: typeDefinition.type,
      data: payloadData,
      dataMeta,
    };
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = "Required";
    }

    sortedFields.forEach((field) => {
      if (field.type === "password" || field.sensitive) {
        const state = secretStates[field.name];
        if (field.required && state) {
          const hasValue = state.isEditing
            ? state.value.length > 0
            : state.isSet;
          if (!hasValue) {
            nextErrors[field.name] = "Required";
          }
        }
        return;
      }

      const value = data[field.name];
      const hasValue = value !== undefined && value !== "" && value !== null;
      if (field.required && !hasValue) {
        nextErrors[field.name] = "Required";
        return;
      }
      if (field.validation && hasValue && typeof value === "string") {
        const { min, max, pattern } = field.validation;
        if (min !== undefined && value.length < min) {
          nextErrors[field.name] = `Min length ${min}`;
        }
        if (max !== undefined && value.length > max) {
          nextErrors[field.name] = `Max length ${max}`;
        }
        if (pattern) {
          try {
            const re = new RegExp(pattern);
            if (!re.test(value)) {
              nextErrors[field.name] = "Invalid format";
            }
          } catch {
            // ignore invalid regex in schema
          }
        }
      }
    });

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(buildPayload());
      setFieldErrors({});
      setFormError(null);
    } catch (err) {
      if (isApiError(err)) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setFormError("Failed to save credential");
      }
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720, width: "100%" }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          {mode === "create" ? "New credential" : "Edit credential"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {typeDefinition.displayName}
        </Typography>
      </Box>

      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        error={Boolean(fieldErrors.name)}
        helperText={fieldErrors.name}
      />

      <Divider />

      <Stack spacing={2}>
        {sortedFields.map((field) => (
          <CredentialFieldRenderer
            key={field.name}
            field={field}
            value={data[field.name]}
            error={fieldErrors[field.name]}
            secretState={secretStates[field.name]}
            onSecretChange={(next) =>
              setSecretStates((prev) => ({ ...prev, [field.name]: next }))
            }
            onChange={(value) =>
              setData((prev) => ({ ...prev, [field.name]: value }))
            }
          />
        ))}
      </Stack>

      <TestCredentialPanel getPayload={buildPayload} disabled={saving} />

      {formError && <Alert severity="error">{formError}</Alert>}

      <Divider />

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {mode === "create" ? "Save" : "Save changes"}
        </Button>
        <Button variant="text" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {mode === "edit" && onDelete && (
          <Button
            variant="text"
            color="error"
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
