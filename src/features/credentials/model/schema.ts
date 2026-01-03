import type { CredentialFieldSchema, CredentialTypeDefinition } from "./types";

export function sortFields(fields: CredentialFieldSchema[]) {
  return [...fields].sort((a, b) => {
    const orderA = a.ui?.order ?? 0;
    const orderB = b.ui?.order ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getSensitiveFieldNames(typeDef?: CredentialTypeDefinition) {
  if (!typeDef) {
    return [];
  }
  return typeDef.fields
    .filter((field) => field.type === "password" || field.sensitive)
    .map((field) => field.name);
}

export function findFieldSchema(
  typeDef: CredentialTypeDefinition,
  fieldName: string
) {
  return typeDef.fields.find((field) => field.name === fieldName);
}
