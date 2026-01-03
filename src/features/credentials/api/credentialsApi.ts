import { createApiError } from "./types";
import type {
  CredentialDetails,
  CredentialPayload,
  CredentialSummary,
  CredentialTypeDefinition,
  TestResult,
} from "../model/types";
import { getSensitiveFieldNames } from "../model/schema";

export type ListCredentialsParams = {
  search?: string;
  types?: string[];
  owned?: "all" | "me" | "shared";
};

export type ListCredentialsResponse = {
  items: CredentialSummary[];
  total: number;
};

const mockOwner = { id: "me", name: "Пользователь" };

const credentialTypes: CredentialTypeDefinition[] = [
  {
    type: "httpBasicAuth",
    displayName: "HTTP Basic Auth",
    description: "Username + password for HTTP requests.",
    fields: [
      {
        name: "username",
        label: "Username",
        type: "string",
        required: true,
        placeholder: "user@example.com",
        ui: { order: 1 },
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        sensitive: true,
        ui: { order: 2 },
      },
    ],
  },
  {
    type: "apiKey",
    displayName: "API Key",
    description: "API key sent in header or query.",
    fields: [
      {
        name: "keyName",
        label: "Key name",
        type: "string",
        required: true,
        default: "Authorization",
        ui: { order: 1 },
      },
      {
        name: "keyValue",
        label: "Key value",
        type: "password",
        required: true,
        sensitive: true,
        ui: { order: 2 },
      },
      {
        name: "addTo",
        label: "Add to",
        type: "select",
        required: true,
        options: [
          { label: "Header", value: "header" },
          { label: "Query", value: "query" },
        ],
        default: "header",
        ui: { order: 3 },
      },
    ],
  },
  {
    type: "openAi",
    displayName: "OpenAI",
    description: "OpenAI API key and optional base URL.",
    fields: [
      {
        name: "apiKey",
        label: "API key",
        type: "password",
        required: true,
        sensitive: true,
        ui: { order: 1 },
      },
      {
        name: "baseUrl",
        label: "Base URL",
        type: "string",
        placeholder: "https://api.openai.com",
        ui: { order: 2 },
      },
    ],
  },
];

let credentialStore: CredentialDetails[] = [
  {
    id: "cred-1",
    name: "GitHub API",
    type: "apiKey",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    owner: mockOwner,
    shared: false,
    data: {
      keyName: "Authorization",
      keyValue: "ghp_mock_123",
      addTo: "header",
    },
  },
  {
    id: "cred-2",
    name: "HTTP Basic",
    type: "httpBasicAuth",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    owner: mockOwner,
    shared: true,
    data: {
      username: "admin",
      password: "secret",
    },
  },
];

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTypeDefinition(type: string) {
  return credentialTypes.find((item) => item.type === type);
}

function sanitizeCredential(details: CredentialDetails): CredentialDetails {
  const typeDef = getTypeDefinition(details.type);
  if (!typeDef) {
    return details;
  }
  const sensitiveFields = new Set(getSensitiveFieldNames(typeDef));
  const nextData: Record<string, unknown> = { ...details.data };
  const dataMeta: Record<string, { isSet: boolean }> = {
    ...(details.dataMeta ?? {}),
  };

  sensitiveFields.forEach((fieldName) => {
    if (fieldName in nextData) {
      const value = nextData[fieldName];
      dataMeta[fieldName] = {
        isSet: value !== undefined && value !== "" && value !== null,
      };
      nextData[fieldName] = undefined;
    } else if (!dataMeta[fieldName]) {
      dataMeta[fieldName] = { isSet: false };
    }
  });

  return {
    ...details,
    data: nextData,
    dataMeta,
  };
}

function buildSummary(details: CredentialDetails): CredentialSummary {
  return {
    id: details.id,
    name: details.name,
    type: details.type,
    updatedAt: details.updatedAt,
    createdAt: details.createdAt,
    owner: details.owner,
    shared: details.shared,
  };
}

function validatePayload(
  typeDef: CredentialTypeDefinition,
  payload: CredentialPayload,
  existingData?: Record<string, unknown>
) {
  const fieldErrors: Record<string, string> = {};
  typeDef.fields.forEach((field) => {
    const rawValue = payload.data[field.name];
    const isSecret = field.type === "password" || field.sensitive;
    const metaIsSet = payload.dataMeta?.[field.name]?.isSet;
    const existingValue = existingData?.[field.name];

    const effectiveValue =
      rawValue === undefined ? existingValue : (rawValue as unknown);

    const hasValue =
      effectiveValue !== undefined && effectiveValue !== "" && effectiveValue !== null;

    if (field.required) {
      if (isSecret) {
        if (!hasValue && !metaIsSet) {
          fieldErrors[field.name] = "Required";
        }
      } else if (!hasValue) {
        fieldErrors[field.name] = "Required";
      }
    }

    if (field.validation && hasValue && typeof effectiveValue === "string") {
      const { min, max, pattern } = field.validation;
      if (min !== undefined && effectiveValue.length < min) {
        fieldErrors[field.name] = `Min length ${min}`;
      }
      if (max !== undefined && effectiveValue.length > max) {
        fieldErrors[field.name] = `Max length ${max}`;
      }
      if (pattern) {
        try {
          const re = new RegExp(pattern);
          if (!re.test(effectiveValue)) {
            fieldErrors[field.name] = "Invalid format";
          }
        } catch {
          // ignore invalid regex in schema
        }
      }
    }
  });

  return fieldErrors;
}

function mergeCredentialData(
  existing: CredentialDetails,
  payload: CredentialPayload
) {
  const typeDef = getTypeDefinition(existing.type);
  if (!typeDef) {
    return { data: payload.data, dataMeta: payload.dataMeta };
  }

  const sensitiveFields = new Set(getSensitiveFieldNames(typeDef));
  const nextData: Record<string, unknown> = { ...existing.data };
  const nextMeta: Record<string, { isSet: boolean }> = {
    ...(existing.dataMeta ?? {}),
  };

  Object.entries(payload.data).forEach(([key, value]) => {
    const isSecret = sensitiveFields.has(key);
    if (isSecret) {
      if (value === undefined) {
        if (payload.dataMeta?.[key]?.isSet === false) {
          nextData[key] = undefined;
          nextMeta[key] = { isSet: false };
        }
        return;
      }
      if (value === "") {
        nextData[key] = undefined;
        nextMeta[key] = { isSet: false };
        return;
      }
      nextData[key] = value;
      nextMeta[key] = { isSet: true };
      return;
    }

    if (value !== undefined) {
      nextData[key] = value;
    }
  });

  return { data: nextData, dataMeta: nextMeta };
}

export async function listCredentialTypes(): Promise<CredentialTypeDefinition[]> {
  await delay();
  return credentialTypes;
}

export async function listCredentials(
  params: ListCredentialsParams = {}
): Promise<ListCredentialsResponse> {
  await delay();
  let items = [...credentialStore];

  if (params.types && params.types.length > 0) {
    items = items.filter((item) => params.types?.includes(item.type));
  }

  if (params.owned && params.owned !== "all") {
    if (params.owned === "shared") {
      items = items.filter((item) => item.shared);
    } else {
      items = items.filter((item) => !item.shared);
    }
  }

  if (params.search) {
    const query = params.search.toLowerCase();
    items = items.filter((item) => item.name.toLowerCase().includes(query));
  }

  const summaries = items
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(buildSummary);

  return { items: summaries, total: summaries.length };
}

export async function getCredential(id: string): Promise<CredentialDetails> {
  await delay();
  const credential = credentialStore.find((item) => item.id === id);
  if (!credential) {
    throw createApiError({ message: "Credential not found", status: 404 });
  }
  return sanitizeCredential(credential);
}

export async function createCredential(
  payload: CredentialPayload
): Promise<{ id: string }> {
  await delay();
  if (!payload.name.trim()) {
    throw createApiError({
      message: "Validation failed",
      status: 422,
      fieldErrors: { name: "Required" },
    });
  }
  const typeDef = getTypeDefinition(payload.type);
  if (!typeDef) {
    throw createApiError({ message: "Unknown credential type", status: 400 });
  }

  const fieldErrors = validatePayload(typeDef, payload);
  if (Object.keys(fieldErrors).length > 0) {
    throw createApiError({
      message: "Validation failed",
      status: 422,
      fieldErrors,
    });
  }

  const now = new Date().toISOString();
  const id = `cred-${Date.now()}`;
  const next: CredentialDetails = {
    id,
    name: payload.name.trim(),
    type: payload.type,
    createdAt: now,
    updatedAt: now,
    owner: mockOwner,
    shared: false,
    data: payload.data,
    dataMeta: payload.dataMeta,
  };

  credentialStore = [next, ...credentialStore];
  return { id };
}

export async function updateCredential(
  id: string,
  payload: CredentialPayload
): Promise<{ ok: true }> {
  await delay();
  if (!payload.name.trim()) {
    throw createApiError({
      message: "Validation failed",
      status: 422,
      fieldErrors: { name: "Required" },
    });
  }
  const index = credentialStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createApiError({ message: "Credential not found", status: 404 });
  }

  const existing = credentialStore[index];
  const typeDef = getTypeDefinition(existing.type);
  if (!typeDef) {
    throw createApiError({ message: "Unknown credential type", status: 400 });
  }

  const merged = mergeCredentialData(existing, payload);
  const fieldErrors = validatePayload(typeDef, payload, merged.data);
  if (Object.keys(fieldErrors).length > 0) {
    throw createApiError({
      message: "Validation failed",
      status: 422,
      fieldErrors,
    });
  }

  const next: CredentialDetails = {
    ...existing,
    name: payload.name.trim(),
    updatedAt: new Date().toISOString(),
    data: merged.data,
    dataMeta: merged.dataMeta,
  };

  credentialStore = [next, ...credentialStore.filter((item) => item.id !== id)];
  return { ok: true };
}

export async function deleteCredential(id: string): Promise<{ ok: true }> {
  await delay();
  credentialStore = credentialStore.filter((item) => item.id !== id);
  return { ok: true };
}

export async function testCredential(
  payload: CredentialPayload
): Promise<TestResult> {
  await delay();
  const typeDef = getTypeDefinition(payload.type);
  if (!typeDef) {
    return {
      ok: false,
      message: "Unknown credential type",
      details: "No schema for this credential type.",
    };
  }

  const fieldErrors = validatePayload(typeDef, payload, payload.data);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Missing required fields",
      details: Object.values(fieldErrors).join(", "),
    };
  }

  return {
    ok: true,
    message: "Connection succeeded",
    details: "All required fields are present.",
  };
}
