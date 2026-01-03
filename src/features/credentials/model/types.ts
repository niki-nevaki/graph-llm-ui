export type OwnerSummary = {
  id: string;
  name: string;
};

export type CredentialSummary = {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  createdAt: string;
  owner?: OwnerSummary;
  shared?: boolean;
};

export type CredentialDetails = CredentialSummary & {
  data: Record<string, unknown>;
  dataMeta?: Record<string, CredentialFieldMeta>;
};

export type CredentialFieldMeta = {
  isSet: boolean;
};

export type CredentialFieldSchema = {
  name: string;
  label: string;
  type:
    | "string"
    | "password"
    | "number"
    | "boolean"
    | "select"
    | "textarea";
  required?: boolean;
  placeholder?: string;
  description?: string;
  default?: unknown;
  options?: { label: string; value: string }[];
  validation?: { min?: number; max?: number; pattern?: string };
  sensitive?: boolean;
  ui?: { group?: string; order?: number; multiline?: boolean };
};

export type CredentialTypeDefinition = {
  type: string;
  displayName: string;
  description?: string;
  icon?: string | { kind: "svg" | "url"; value: string };
  fields: CredentialFieldSchema[];
};

export type CredentialPayload = {
  name: string;
  type: string;
  data: Record<string, unknown>;
  dataMeta?: Record<string, CredentialFieldMeta>;
};

export type TestResult = {
  ok: boolean;
  message: string;
  details?: string;
};
