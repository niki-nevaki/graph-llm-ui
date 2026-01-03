import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createAuthClient } from "../../api/authClient";
import { isAuthError } from "../../model/types";
import { useLoginForm } from "../LoginModal/useLoginForm";
import { AuthBackground } from "../AuthBackground/AuthBackground";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

export function RegisterPage() {
  const navigate = useNavigate();
  const authClient = useMemo(() => createAuthClient(), []);
  const {
    values,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    touchAll,
    setExternalErrors,
  } = useLoginForm({ includeConfirm: true });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showError = (field: "login" | "password") =>
    touched[field] || submitAttempted ? errors[field] : undefined;
  const showConfirmError = () =>
    touched.confirmPassword || submitAttempted ? errors.confirmPassword : undefined;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    touchAll();
    if (!isValid) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await authClient.register({
        login: values.login.trim(),
        password: values.password,
      });
      setToast({
        open: true,
        message: "Регистрация отправлена",
        severity: "success",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        setSubmitError(err.message);
        if (err.fieldErrors) {
          setExternalErrors(err.fieldErrors);
        }
      } else {
        setSubmitError("Не удалось зарегистрироваться");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeToast = () => setToast(null);

  return (
    <AuthBackground>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Регистрация</Typography>
          <TextField
            label="Логин"
            type="email"
            value={values.login}
            onChange={(event) => setField("login", event.target.value)}
            onBlur={() => markTouched("login")}
            error={Boolean(showError("login"))}
            helperText={showError("login")}
            placeholder="name@example.com"
            fullWidth
          />
          <TextField
            label="Пароль"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => setField("password", event.target.value)}
            onBlur={() => markTouched("password")}
            error={Boolean(showError("password"))}
            helperText={showError("password")}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Подтверждение пароля"
            type={showConfirmPassword ? "text" : "password"}
            value={values.confirmPassword}
            onChange={(event) => setField("confirmPassword", event.target.value)}
            onBlur={() => markTouched("confirmPassword")}
            error={Boolean(showConfirmError())}
            helperText={showConfirmError()}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
                    }
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {submitError && <Alert severity="error">{submitError}</Alert>}
          {submitAttempted && !isValid && (
            <Alert severity="warning">
              Проверьте формат email и заполните все поля.
            </Alert>
          )}
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              disabled={submitting}
            >
              Назад ко входу
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Зарегистрироваться
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={Boolean(toast?.open)}
        autoHideDuration={3000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={closeToast}>
            {toast.message}
          </Alert>
        ) : null}
      </Snackbar>
    </AuthBackground>
  );
}
