import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../state/useAuth";
import { LoginModal } from "../LoginModal/LoginModal";
import { RegisterModal } from "../RegisterModal/RegisterModal";
import type { LoginDto, RegisterDto } from "../../api/authClient";
import { createAuthClient } from "../../api/authClient";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

export function HeaderAuthWidget() {
  const { status, login, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const prevStatusRef = useRef(status);
  const authClient = useRef(createAuthClient());

  const handleLogin = async (dto: LoginDto) => {
    await login(dto);
  };

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleRegister = async (dto: RegisterDto) => {
    await authClient.current.register(dto);
    setToast({
      open: true,
      message: "Регистрация отправлена",
      severity: "success",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      setToast({ open: true, message: "Не удалось выйти", severity: "error" });
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === "guest" && status === "auth") {
      setToast({ open: true, message: "Вход выполнен", severity: "success" });
    }
    if (prev === "auth" && status === "guest") {
      setToast({ open: true, message: "Выход выполнен", severity: "success" });
    }
    prevStatusRef.current = status;
  }, [status]);

  if (status === "loading") {
    return <CircularProgress size={18} />;
  }

  return (
    <>
      {status === "guest" ? (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Войти">
            <IconButton aria-label="Войти" onClick={openLogin}>
              <LoginIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Регистрация">
            <IconButton aria-label="Регистрация" onClick={openRegister}>
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Tooltip title="Выйти">
          <IconButton aria-label="Выйти" onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setRegisterOpen(false);
        }}
        onSubmit={handleLogin}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => {
          setRegisterOpen(false);
          setLoginOpen(false);
        }}
        onSubmit={handleRegister}
      />

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
        ) : (
          <Box />
        )}
      </Snackbar>
    </>
  );
}
