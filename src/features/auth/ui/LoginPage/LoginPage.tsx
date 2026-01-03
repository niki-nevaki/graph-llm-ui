import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/useAuth";
import { useLoginForm } from "../LoginModal/useLoginForm";
import { isAuthError } from "../../model/types";
import { AuthBackground } from "../AuthBackground/AuthBackground";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

type LocationState = {
  from?: { pathname: string };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    values,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    touchAll,
    setExternalErrors,
  } = useLoginForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fromPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? "/graphs";
  }, [location.state]);

  const showError = (field: "login" | "password") =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    touchAll();
    if (!isValid) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await login({ login: values.login.trim(), password: values.password });
      navigate(fromPath, { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        setSubmitError(err.message);
        if (err.fieldErrors) {
          setExternalErrors(err.fieldErrors);
        }
      } else {
        setSubmitError("Не удалось войти");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Вход</Typography>
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
          {submitError && <Alert severity="error">{submitError}</Alert>}
          {submitAttempted && !isValid && (
            <Alert severity="warning">
              Проверьте формат email и заполните обязательные поля.
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            Войти
          </Button>
        </Stack>
      </Paper>
    </AuthBackground>
  );
}
