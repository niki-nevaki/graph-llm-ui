import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import type { RegisterDto } from "../../api/authClient";
import { isAuthError } from "../../model/types";
import { useLoginForm } from "../LoginModal/useLoginForm";

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: RegisterDto) => Promise<void>;
};

export function RegisterModal({ open, onClose, onSubmit }: RegisterModalProps) {
  const {
    values,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    touchAll,
    reset,
    setExternalErrors,
  } = useLoginForm({ includeConfirm: true });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      reset();
      setSubmitting(false);
      setSubmitError(null);
      setSubmitAttempted(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, reset]);

  const showError = (field: "login" | "password") =>
    touched[field] || submitAttempted ? errors[field] : undefined;
  const showConfirmError = () =>
    touched.confirmPassword || submitAttempted
      ? errors.confirmPassword
      : undefined;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    touchAll();
    if (!isValid) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        login: values.login.trim(),
        password: values.password,
      });
      onClose();
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ backdrop: { sx: { backgroundColor: "transparent" } } }}
    >
      <DialogTitle>Регистрация</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Логин"
            type="email"
            value={values.login}
            onChange={(event) => setField("login", event.target.value)}
            onBlur={() => markTouched("login")}
            error={Boolean(showError("login"))}
            helperText={showError("login")}
            placeholder="name@example.com"
            autoFocus
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Зарегистрироваться
        </Button>
      </DialogActions>
    </Dialog>
  );
}
