import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../api/types";
import { isApiError } from "../api/types";
import type { CredentialSummary } from "../model/types";
import {
  listCredentials,
  type ListCredentialsParams,
} from "../api/credentialsApi";

export function useCredentialsList(params: ListCredentialsParams) {
  const [items, setItems] = useState<CredentialSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCredentials(params);
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(isApiError(err) ? err : { message: "Failed to load list" });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, total, loading, error, reload: load };
}
