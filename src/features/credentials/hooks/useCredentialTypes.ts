import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../api/types";
import { isApiError } from "../api/types";
import type { CredentialTypeDefinition } from "../model/types";
import { listCredentialTypes } from "../api/credentialsApi";

export function useCredentialTypes() {
  const [items, setItems] = useState<CredentialTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCredentialTypes();
      setItems(response);
    } catch (err) {
      setError(isApiError(err) ? err : { message: "Не удалось загрузить типы" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, reload: load };
}
