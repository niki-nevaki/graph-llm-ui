import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";

export type SecretFieldState = {
  value: string;
  isSet: boolean;
  isEditing: boolean;
  initialIsSet: boolean;
};

type SecretFieldProps = {
  label: string;
  description?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  state: SecretFieldState;
  onChange: (next: SecretFieldState) => void;
};

export function SecretField({
  label,
  description,
  required,
  error,
  helperText,
  state,
  onChange,
}: SecretFieldProps) {
  const [reveal, setReveal] = useState(false);

  const canCopy = state.isEditing && state.value.length > 0;

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(state.value);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <Stack spacing={1}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        {required && (
          <Typography component="span" color="error.main">
            *
          </Typography>
        )}
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}

      {!state.isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            type="password"
            value={state.isSet ? "••••••••" : ""}
            placeholder={state.isSet ? "Сохранено" : "Не задано"}
            disabled
            error={error}
            helperText={helperText}
          />
          <Button
            variant="outlined"
            onClick={() =>
              onChange({
                ...state,
                isEditing: true,
                value: "",
              })
            }
          >
            Заменить
          </Button>
          {state.isSet && (
            <Button
              variant="text"
              color="error"
              onClick={() =>
                onChange({
                  ...state,
                  isSet: false,
                  isEditing: false,
                  value: "",
                })
              }
            >
              Очистить
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            type={reveal ? "text" : "password"}
            value={state.value}
            onChange={(event) =>
              onChange({
                ...state,
                value: event.target.value,
                isSet: event.target.value.length > 0,
              })
            }
            error={error}
            helperText={helperText}
          />
          <Button variant="outlined" onClick={() => setReveal((prev) => !prev)}>
            {reveal ? "Скрыть" : "Показать"}
          </Button>
          {canCopy && (
            <Tooltip title="Копировать">
              <IconButton onClick={handleCopy} aria-label="Копировать секрет">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {state.initialIsSet && (
            <Button
              variant="text"
              onClick={() =>
                onChange({
                  ...state,
                  isEditing: false,
                  value: "",
                  isSet: true,
                })
              }
            >
              Отмена
            </Button>
          )}
        </Box>
      )}
    </Stack>
  );
}
