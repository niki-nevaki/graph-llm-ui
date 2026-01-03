import { useCallback, useMemo, useState } from "react";

type AuthField = "login" | "password" | "confirmPassword";

type AuthValues = {
  login: string;
  password: string;
  confirmPassword: string;
};

type AuthErrors = Partial<Record<AuthField, string>>;

type TouchedState = Record<AuthField, boolean>;

type AuthFormOptions = {
  includeConfirm?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: AuthValues, includeConfirm: boolean): AuthErrors {
  const errors: AuthErrors = {};
  const login = values.login.trim();
  if (!login) {
    errors.login = "Обязательное поле";
  } else if (!EMAIL_RE.test(login)) {
    errors.login = "Введите email в формате name@example.com";
  }
  if (!values.password) {
    errors.password = "Обязательное поле";
  } else if (values.password.length < 6) {
    errors.password = "Минимум 6 символов";
  }
  if (includeConfirm) {
    if (!values.confirmPassword) {
      errors.confirmPassword = "Обязательное поле";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Пароли не совпадают";
    }
  }
  return errors;
}

export function useLoginForm(options: AuthFormOptions = {}) {
  const includeConfirm = options.includeConfirm ?? false;
  const [values, setValues] = useState<AuthValues>({
    login: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<TouchedState>({
    login: false,
    password: false,
    confirmPassword: false,
  });
  const [externalErrors, setExternalErrors] = useState<AuthErrors>({});

  const validationErrors = useMemo(
    () => validate(values, includeConfirm),
    [values, includeConfirm]
  );
  const errors = useMemo(
    () => ({ ...validationErrors, ...externalErrors }),
    [validationErrors, externalErrors]
  );

  const isValid = Object.keys(validationErrors).length === 0;

  const setField = useCallback((field: AuthField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setExternalErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const markTouched = useCallback((field: AuthField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback(() => {
    setTouched({ login: true, password: true, confirmPassword: true });
  }, []);

  const reset = useCallback(() => {
    setValues({ login: "", password: "", confirmPassword: "" });
    setTouched({ login: false, password: false, confirmPassword: false });
    setExternalErrors({});
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    setField,
    markTouched,
    touchAll,
    reset,
    setExternalErrors,
  };
}
