import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTestCredential } from "../../hooks/useTestCredential";
import type { CredentialPayload } from "../../model/types";

type TestCredentialPanelProps = {
  getPayload: () => CredentialPayload;
  disabled?: boolean;
};

export function TestCredentialPanel({
  getPayload,
  disabled,
}: TestCredentialPanelProps) {
  const { status, result, error, runTest, reset } = useTestCredential();

  const handleTest = async () => {
    reset();
    await runTest(getPayload());
  };

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleTest}
          disabled={disabled || status === "running"}
        >
          Проверить соединение
        </Button>
        {status === "running" && <CircularProgress size={18} />}
        {status === "success" && (
          <Typography variant="body2" color="success.main">
            Успешно
          </Typography>
        )}
        {status === "error" && (
          <Typography variant="body2" color="error.main">
            Ошибка
          </Typography>
        )}
      </Box>
      {result && (
        <Alert severity={result.ok ? "success" : "error"}>
          <Typography variant="subtitle2">{result.message}</Typography>
          {result.details && (
            <Typography variant="body2">{result.details}</Typography>
          )}
        </Alert>
      )}
      {error && (
        <Alert severity="error">
          <Typography variant="subtitle2">{error.message}</Typography>
          {error.details && (
            <Typography variant="body2">{error.details}</Typography>
          )}
        </Alert>
      )}
    </Stack>
  );
}
