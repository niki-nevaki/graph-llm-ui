import { useCallback, useState } from "react";
import type { ApiError } from "../api/types";
import { isApiError } from "../api/types";
import type { CredentialPayload, TestResult } from "../model/types";
import { testCredential } from "../api/credentialsApi";

export function useTestCredential() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">(
    "idle"
  );
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const runTest = useCallback(async (payload: CredentialPayload) => {
    setStatus("running");
    setError(null);
    try {
      const response = await testCredential(payload);
      setResult(response);
      setStatus(response.ok ? "success" : "error");
    } catch (err) {
      setError(isApiError(err) ? err : { message: "Проверка не удалась" });
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, runTest, reset };
}
