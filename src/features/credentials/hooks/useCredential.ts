import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../api/types";
import { isApiError } from "../api/types";
import type { CredentialDetails } from "../model/types";
import { getCredential } from "../api/credentialsApi";

export function useCredential(id?: string) {
  const [data, setData] = useState<CredentialDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getCredential(id);
      setData(response);
    } catch (err) {
      setError(isApiError(err) ? err : { message: "Failed to load credential" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
