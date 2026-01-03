export type ApiFieldErrors = Record<string, string>;

export type ApiError = {
  message: string;
  code?: string;
  details?: string;
  status?: number;
  fieldErrors?: ApiFieldErrors;
};

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== "object") {
    return false;
  }
  return "message" in error;
}

export function createApiError(payload: ApiError): ApiError {
  return payload;
}
