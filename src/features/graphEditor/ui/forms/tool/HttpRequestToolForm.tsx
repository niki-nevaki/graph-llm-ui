import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import {
  createDefaultFieldValue,
  createDefaultHttpRequestToolConfig,
  type FieldValue,
  type HttpRequestToolConfig,
  type ToolDefinitionNode,
} from "../../../../../domain/workflow";

const METHOD_OPTIONS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

const AUTH_TYPES = [
  "none",
  "predefined",
  "basic",
  "digest",
  "header",
  "bearer",
  "oauth1",
  "oauth2",
  "query",
  "custom",
] as const;

const RESPONSE_FORMATS = ["autodetect", "file", "json", "text"] as const;

function normalizeFieldValue(value?: FieldValue): FieldValue {
  if (!value) return createDefaultFieldValue();
  return {
    mode: value.mode ?? "fixed",
    value: value.value ?? "",
    expression: value.expression ?? "",
    fromAI: {
      hint: value.fromAI?.hint ?? "",
      key: value.fromAI?.key ?? "",
      description: value.fromAI?.description ?? "",
      type: value.fromAI?.type ?? "",
      defaultValue: value.fromAI?.defaultValue ?? "",
    },
  };
}

function mergeHttpRequestConfig(
  incoming?: HttpRequestToolConfig
): HttpRequestToolConfig {
  const defaults = createDefaultHttpRequestToolConfig();
  const paginationFromIncoming = incoming?.options?.pagination as
    | {
        mode?: HttpRequestToolConfig["options"]["pagination"]["mode"];
        configJson?: string;
        config?: unknown;
      }
    | undefined;
  const paginationConfigJson =
    typeof paginationFromIncoming?.configJson === "string"
      ? paginationFromIncoming.configJson
      : paginationFromIncoming && "config" in paginationFromIncoming
      ? JSON.stringify(
          (paginationFromIncoming as { config?: unknown }).config ?? {},
          null,
          2
        )
      : defaults.options.pagination.configJson;
  return {
    ...defaults,
    ...incoming,
    base: {
      ...defaults.base,
      ...incoming?.base,
      authentication: {
        ...defaults.base.authentication,
        ...incoming?.base?.authentication,
        credentialRef: {
          ...defaults.base.authentication.credentialRef,
          ...incoming?.base?.authentication?.credentialRef,
        },
        inlineAuth: {
          ...defaults.base.authentication.inlineAuth,
          ...incoming?.base?.authentication?.inlineAuth,
        },
      },
    },
    query: {
      ...defaults.query,
      ...incoming?.query,
      queryParameters: incoming?.query?.queryParameters ?? defaults.query.queryParameters,
    },
    headers: {
      ...defaults.headers,
      ...incoming?.headers,
      headerParameters: incoming?.headers?.headerParameters ?? defaults.headers.headerParameters,
    },
    body: {
      ...defaults.body,
      ...incoming?.body,
      bodyParameters: incoming?.body?.bodyParameters ?? defaults.body.bodyParameters,
    },
    options: {
      ...defaults.options,
      ...incoming?.options,
      batching: {
        ...defaults.options.batching,
        ...incoming?.options?.batching,
      },
      redirects: {
        ...defaults.options.redirects,
        ...incoming?.options?.redirects,
      },
      responseOptions: {
        ...defaults.options.responseOptions,
        ...incoming?.options?.responseOptions,
      },
      pagination: {
        mode:
          paginationFromIncoming?.mode ?? defaults.options.pagination.mode,
        configJson: paginationConfigJson,
      },
    },
    toolOnly: {
      ...defaults.toolOnly,
      ...incoming?.toolOnly,
      jsonOptimize: {
        ...defaults.toolOnly.jsonOptimize,
        ...incoming?.toolOnly?.jsonOptimize,
      },
      htmlOptimize: {
        ...defaults.toolOnly.htmlOptimize,
        ...incoming?.toolOnly?.htmlOptimize,
      },
      textOptimize: {
        ...defaults.toolOnly.textOptimize,
        ...incoming?.toolOnly?.textOptimize,
      },
    },
  };
}

function FieldValueInput(props: {
  label: string;
  value?: FieldValue;
  onChange: (next: FieldValue) => void;
}) {
  const { label, value, onChange } = props;
  const normalized = normalizeFieldValue(value);

  const onModeChange = (mode: FieldValue["mode"]) => {
    onChange({ ...normalized, mode });
  };

  const onValueChange = (nextValue: string) => {
    if (normalized.mode === "expression") {
      onChange({ ...normalized, expression: nextValue });
      return;
    }
    if (normalized.mode === "fromAI") {
      onChange({
        ...normalized,
        fromAI: { ...normalized.fromAI, hint: nextValue },
      });
      return;
    }
    onChange({ ...normalized, value: nextValue });
  };

  const inputValue =
    normalized.mode === "expression"
      ? normalized.expression ?? ""
      : normalized.mode === "fromAI"
      ? normalized.fromAI?.hint ?? ""
      : normalized.value ?? "";

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Режим</InputLabel>
        <Select
          label="Режим"
          value={normalized.mode}
          onChange={(e) => onModeChange(e.target.value as FieldValue["mode"])}
        >
          <MenuItem value="fixed">Значение</MenuItem>
          <MenuItem value="expression">Выражение</MenuItem>
          <MenuItem value="fromAI">Из модели</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={
          normalized.mode === "expression"
            ? `${label} (выражение)`
            : normalized.mode === "fromAI"
            ? `${label} (подсказка)`
            : label
        }
        size="small"
        fullWidth
        value={inputValue}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </Stack>
  );
}

export function HttpRequestToolForm(props: {
  data: ToolDefinitionNode;
  onChange: (patch: Partial<ToolDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;
  const config = useMemo(
    () => mergeHttpRequestConfig(data.config.httpRequest),
    [data.config.httpRequest]
  );

  const updateConfig = (next: HttpRequestToolConfig) => {
    onChange({ httpRequest: next });
  };

  const updateBase = (patch: Partial<HttpRequestToolConfig["base"]>) => {
    updateConfig({ ...config, base: { ...config.base, ...patch } });
  };

  const updateAuth = (
    patch: Partial<HttpRequestToolConfig["base"]["authentication"]>
  ) => {
    updateBase({
      authentication: { ...config.base.authentication, ...patch },
    });
  };

  const updateQuery = (patch: Partial<HttpRequestToolConfig["query"]>) => {
    updateConfig({ ...config, query: { ...config.query, ...patch } });
  };

  const updateHeaders = (patch: Partial<HttpRequestToolConfig["headers"]>) => {
    updateConfig({ ...config, headers: { ...config.headers, ...patch } });
  };

  const updateBody = (patch: Partial<HttpRequestToolConfig["body"]>) => {
    updateConfig({ ...config, body: { ...config.body, ...patch } });
  };

  const updateOptions = (patch: Partial<HttpRequestToolConfig["options"]>) => {
    updateConfig({ ...config, options: { ...config.options, ...patch } });
  };

  const updateToolOnly = (
    patch: Partial<HttpRequestToolConfig["toolOnly"]>
  ) => {
    updateConfig({ ...config, toolOnly: { ...config.toolOnly, ...patch } });
  };

  const updateQueryParam = (index: number, patch: { name?: string; value?: FieldValue }) => {
    updateQuery({
      queryParameters: config.query.queryParameters.map((param, i) =>
        i === index ? { ...param, ...patch } : param
      ),
    });
  };

  const updateHeaderParam = (index: number, patch: { name?: string; value?: FieldValue }) => {
    updateHeaders({
      headerParameters: config.headers.headerParameters.map((param, i) =>
        i === index ? { ...param, ...patch } : param
      ),
    });
  };

  const updateBodyParam = (
    index: number,
    patch: {
      name?: string;
      value?: FieldValue;
      isBinary?: boolean;
      inputDataFieldName?: string;
    }
  ) => {
    updateBody({
      bodyParameters: config.body.bodyParameters.map((param, i) =>
        i === index ? { ...param, ...patch } : param
      ),
    });
  };

  const addQueryParam = () => {
    updateQuery({
      queryParameters: config.query.queryParameters.concat({
        name: "",
        value: createDefaultFieldValue(),
      }),
    });
  };

  const addHeaderParam = () => {
    updateHeaders({
      headerParameters: config.headers.headerParameters.concat({
        name: "",
        value: createDefaultFieldValue(),
      }),
    });
  };

  const addBodyParam = () => {
    updateBody({
      bodyParameters: config.body.bodyParameters.concat({
        name: "",
        value: createDefaultFieldValue(),
        isBinary: false,
        inputDataFieldName: "",
      }),
    });
  };

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Typography variant="subtitle2">Запрос</Typography>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel>Метод</InputLabel>
          <Select
            label="Метод"
            value={config.base.method}
            onChange={(e) =>
              updateBase({ method: e.target.value as HttpRequestToolConfig["base"]["method"] })
            }
            inputProps={{ "data-field-path": "config.httpRequest.base.method" }}
          >
            {METHOD_OPTIONS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="URL"
          size="small"
          value={config.base.url}
          onChange={(e) => updateBase({ url: e.target.value })}
          fullWidth
          inputProps={{ "data-field-path": "config.httpRequest.base.url" }}
        />
      </Stack>

      <Typography variant="subtitle2">Аутентификация</Typography>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel>Тип</InputLabel>
          <Select
            label="Тип"
            value={config.base.authentication.authType}
            onChange={(e) => updateAuth({ authType: e.target.value as HttpRequestToolConfig["base"]["authentication"]["authType"] })}
          >
            {AUTH_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {config.base.authentication.authType === "predefined" ? (
          <Stack spacing={1}>
            <TextField
              label="ID учетных данных"
              size="small"
              value={config.base.authentication.credentialRef?.id ?? ""}
              onChange={(e) =>
                updateAuth({
                  credentialRef: {
                    ...config.base.authentication.credentialRef,
                    id: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Название учетных данных"
              size="small"
              value={config.base.authentication.credentialRef?.name ?? ""}
              onChange={(e) =>
                updateAuth({
                  credentialRef: {
                    ...config.base.authentication.credentialRef,
                    name: e.target.value,
                  },
                })
              }
              fullWidth
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "basic" ? (
          <Stack spacing={1}>
            <FieldValueInput
              label="Логин"
              value={config.base.authentication.inlineAuth?.basic?.username}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    basic: {
                      username: value,
                      password: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.basic?.password
                      ),
                    },
                  },
                })
              }
            />
            <FieldValueInput
              label="Пароль"
              value={config.base.authentication.inlineAuth?.basic?.password}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    basic: {
                      username: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.basic?.username
                      ),
                      password: value,
                    },
                  },
                })
              }
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "digest" ? (
          <Stack spacing={1}>
            <FieldValueInput
              label="Логин"
              value={config.base.authentication.inlineAuth?.digest?.username}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    digest: {
                      username: value,
                      password: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.digest?.password
                      ),
                    },
                  },
                })
              }
            />
            <FieldValueInput
              label="Пароль"
              value={config.base.authentication.inlineAuth?.digest?.password}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    digest: {
                      username: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.digest?.username
                      ),
                      password: value,
                    },
                  },
                })
              }
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "bearer" ? (
          <FieldValueInput
            label="Токен"
            value={config.base.authentication.inlineAuth?.bearer?.token}
            onChange={(value) =>
              updateAuth({
                inlineAuth: {
                  ...config.base.authentication.inlineAuth,
                  bearer: { token: value },
                },
              })
            }
          />
        ) : null}

        {config.base.authentication.authType === "header" ? (
          <Stack spacing={1}>
            <TextField
              label="Имя заголовка"
              size="small"
              value={config.base.authentication.inlineAuth?.header?.headerName ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    header: {
                      headerName: e.target.value,
                      headerValue: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.header?.headerValue
                      ),
                    },
                  },
                })
              }
              fullWidth
            />
            <FieldValueInput
              label="Значение"
              value={config.base.authentication.inlineAuth?.header?.headerValue}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    header: {
                      headerName:
                        config.base.authentication.inlineAuth?.header?.headerName ?? "",
                      headerValue: value,
                    },
                  },
                })
              }
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "query" ? (
          <Stack spacing={1}>
            <TextField
              label="Ключ query"
              size="small"
              value={config.base.authentication.inlineAuth?.query?.queryName ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    query: {
                      queryName: e.target.value,
                      queryValue: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.query?.queryValue
                      ),
                    },
                  },
                })
              }
              fullWidth
            />
            <FieldValueInput
              label="Значение query"
              value={config.base.authentication.inlineAuth?.query?.queryValue}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    query: {
                      queryName:
                        config.base.authentication.inlineAuth?.query?.queryName ?? "",
                      queryValue: value,
                    },
                  },
                })
              }
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "custom" ? (
          <TextField
            label="Пользовательский JSON"
            size="small"
            fullWidth
            multiline
            minRows={4}
            value={config.base.authentication.inlineAuth?.custom?.customAuthJson ?? ""}
            onChange={(e) =>
              updateAuth({
                inlineAuth: {
                  ...config.base.authentication.inlineAuth,
                  custom: { customAuthJson: e.target.value },
                },
              })
            }
          />
        ) : null}

        {config.base.authentication.authType === "oauth1" ? (
          <Stack spacing={1}>
            <FieldValueInput
              label="Ключ consumer"
              value={config.base.authentication.inlineAuth?.oauth1?.consumerKey}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    oauth1: {
                      consumerKey: value,
                      consumerSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerSecret
                      ),
                      token: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.token
                      ),
                      tokenSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.tokenSecret
                      ),
                      signatureMethod:
                        config.base.authentication.inlineAuth?.oauth1?.signatureMethod ?? "",
                    },
                  },
                })
              }
            />
            <FieldValueInput
              label="Секрет consumer"
              value={config.base.authentication.inlineAuth?.oauth1?.consumerSecret}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    oauth1: {
                      consumerKey: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerKey
                      ),
                      consumerSecret: value,
                      token: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.token
                      ),
                      tokenSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.tokenSecret
                      ),
                      signatureMethod:
                        config.base.authentication.inlineAuth?.oauth1?.signatureMethod ?? "",
                    },
                  },
                })
              }
            />
            <FieldValueInput
              label="Токен"
              value={config.base.authentication.inlineAuth?.oauth1?.token}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    oauth1: {
                      consumerKey: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerKey
                      ),
                      consumerSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerSecret
                      ),
                      token: value,
                      tokenSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.tokenSecret
                      ),
                      signatureMethod:
                        config.base.authentication.inlineAuth?.oauth1?.signatureMethod ?? "",
                    },
                  },
                })
              }
            />
            <FieldValueInput
              label="Секрет токена"
              value={config.base.authentication.inlineAuth?.oauth1?.tokenSecret}
              onChange={(value) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    oauth1: {
                      consumerKey: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerKey
                      ),
                      consumerSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerSecret
                      ),
                      token: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.token
                      ),
                      tokenSecret: value,
                      signatureMethod:
                        config.base.authentication.inlineAuth?.oauth1?.signatureMethod ?? "",
                    },
                  },
                })
              }
            />
            <TextField
              label="Метод подписи"
              size="small"
              value={config.base.authentication.inlineAuth?.oauth1?.signatureMethod ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.base.authentication.inlineAuth,
                    oauth1: {
                      consumerKey: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerKey
                      ),
                      consumerSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.consumerSecret
                      ),
                      token: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.token
                      ),
                      tokenSecret: normalizeFieldValue(
                        config.base.authentication.inlineAuth?.oauth1?.tokenSecret
                      ),
                      signatureMethod: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
          </Stack>
        ) : null}

        {config.base.authentication.authType === "oauth2" ? (
          <FieldValueInput
            label="Токен доступа"
            value={config.base.authentication.inlineAuth?.oauth2?.accessToken}
            onChange={(value) =>
              updateAuth({
                inlineAuth: {
                  ...config.base.authentication.inlineAuth,
                  oauth2: { accessToken: value },
                },
              })
            }
          />
        ) : null}
      </Stack>

      <Typography variant="subtitle2">Параметры запроса</Typography>
      <Stack spacing={1.5}>
        <FormControlLabel
          control={
            <Switch
              checked={config.query.sendQueryParameters}
              onChange={(e) =>
                updateQuery({ sendQueryParameters: e.target.checked })
              }
            />
          }
          label="Отправлять параметры"
        />

        {config.query.sendQueryParameters ? (
          <Stack spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Режим</InputLabel>
              <Select
                label="Режим"
                value={config.query.queryParamsMode}
                onChange={(e) =>
                  updateQuery({ queryParamsMode: e.target.value as "fields" | "json" })
                }
              >
                <MenuItem value="fields">Поля</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            {config.query.queryParamsMode === "fields" ? (
              <Stack spacing={1}>
                {config.query.queryParameters.map((param, index) => (
                  <Stack spacing={1} key={`query-${index}`}>
                    <TextField
                      label="Имя"
                      size="small"
                      value={param.name}
                      onChange={(e) =>
                        updateQueryParam(index, { name: e.target.value })
                      }
                      fullWidth
                    />
                    <FieldValueInput
                      label="Значение"
                      value={param.value}
                      onChange={(value) => updateQueryParam(index, { value })}
                    />
                  </Stack>
                ))}
                <TextField
                  label="Добавить параметр"
                  size="small"
                  value=""
                  placeholder="Нажмите Enter чтобы добавить"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addQueryParam();
                    }
                  }}
                  fullWidth
                />
              </Stack>
            ) : (
              <TextField
                label="JSON параметров"
                size="small"
                multiline
                minRows={4}
                value={config.query.queryParametersJson}
                onChange={(e) =>
                  updateQuery({ queryParametersJson: e.target.value })
                }
                fullWidth
              />
            )}
          </Stack>
        ) : null}
      </Stack>

      <Typography variant="subtitle2">Заголовки</Typography>
      <Stack spacing={1.5}>
        <FormControlLabel
          control={
            <Switch
              checked={config.headers.sendHeaders}
              onChange={(e) =>
                updateHeaders({ sendHeaders: e.target.checked })
              }
            />
          }
          label="Отправлять заголовки"
        />

        {config.headers.sendHeaders ? (
          <Stack spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Режим</InputLabel>
              <Select
                label="Режим"
                value={config.headers.headersMode}
                onChange={(e) =>
                  updateHeaders({ headersMode: e.target.value as "fields" | "json" })
                }
              >
                <MenuItem value="fields">Поля</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            {config.headers.headersMode === "fields" ? (
              <Stack spacing={1}>
                {config.headers.headerParameters.map((param, index) => (
                  <Stack spacing={1} key={`header-${index}`}>
                    <TextField
                      label="Имя"
                      size="small"
                      value={param.name}
                      onChange={(e) =>
                        updateHeaderParam(index, { name: e.target.value })
                      }
                      fullWidth
                    />
                    <FieldValueInput
                      label="Значение"
                      value={param.value}
                      onChange={(value) => updateHeaderParam(index, { value })}
                    />
                  </Stack>
                ))}
                <TextField
                  label="Добавить заголовок"
                  size="small"
                  value=""
                  placeholder="Нажмите Enter чтобы добавить"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHeaderParam();
                    }
                  }}
                  fullWidth
                />
              </Stack>
            ) : (
              <TextField
                label="JSON заголовков"
                size="small"
                multiline
                minRows={4}
                value={config.headers.headerParametersJson}
                onChange={(e) =>
                  updateHeaders({ headerParametersJson: e.target.value })
                }
                fullWidth
              />
            )}
          </Stack>
        ) : null}
      </Stack>

      <Typography variant="subtitle2">Тело запроса</Typography>
      <Stack spacing={1.5}>
        <FormControlLabel
          control={
            <Switch
              checked={config.body.sendBody}
              onChange={(e) => updateBody({ sendBody: e.target.checked })}
            />
          }
          label="Отправлять тело"
        />

        {config.body.sendBody ? (
          <Stack spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Тип</InputLabel>
              <Select
                label="Тип"
                value={config.body.bodyContentType}
                onChange={(e) =>
                  updateBody({
                    bodyContentType: e.target.value as HttpRequestToolConfig["body"]["bodyContentType"],
                  })
                }
              >
                <MenuItem value="formUrlencoded">Form Urlencoded</MenuItem>
                <MenuItem value="formData">Form Data</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="n8nBinaryFile">n8n Binary File</MenuItem>
                <MenuItem value="raw">Raw</MenuItem>
              </Select>
            </FormControl>

            {config.body.bodyContentType === "json" ? (
              <TextField
                label="JSON"
                size="small"
                multiline
                minRows={6}
                value={config.body.jsonBody}
                onChange={(e) => updateBody({ jsonBody: e.target.value })}
                fullWidth
              />
            ) : null}

            {config.body.bodyContentType === "raw" ? (
              <Stack spacing={1}>
                <TextField
                  label="Content-Type"
                  size="small"
                  value={config.body.rawContentType}
                  onChange={(e) => updateBody({ rawContentType: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Raw"
                  size="small"
                  multiline
                  minRows={6}
                  value={config.body.rawBody}
                  onChange={(e) => updateBody({ rawBody: e.target.value })}
                  fullWidth
                />
              </Stack>
            ) : null}

            {config.body.bodyContentType === "n8nBinaryFile" ? (
              <TextField
                label="Поле входных данных"
                size="small"
                value={config.body.inputDataFieldName}
                onChange={(e) =>
                  updateBody({ inputDataFieldName: e.target.value })
                }
                fullWidth
              />
            ) : null}

            {config.body.bodyContentType === "formUrlencoded" ||
            config.body.bodyContentType === "formData" ? (
              <Stack spacing={1}>
                {config.body.bodyParameters.map((param, index) => (
                  <Stack spacing={1} key={`body-${index}`}>
                    <TextField
                      label="Имя"
                      size="small"
                      value={param.name}
                      onChange={(e) =>
                        updateBodyParam(index, { name: e.target.value })
                      }
                      fullWidth
                    />
                    <FieldValueInput
                      label="Значение"
                      value={param.value}
                      onChange={(value) => updateBodyParam(index, { value })}
                    />
                    {config.body.bodyContentType === "formData" ? (
                      <Stack spacing={1}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(param.isBinary)}
                              onChange={(e) =>
                                updateBodyParam(index, {
                                  isBinary: e.target.checked,
                                })
                              }
                            />
                          }
                          label="Бинарный файл"
                        />
                        {param.isBinary ? (
                          <TextField
                            label="Поле входных данных"
                            size="small"
                            value={param.inputDataFieldName ?? ""}
                            onChange={(e) =>
                              updateBodyParam(index, {
                                inputDataFieldName: e.target.value,
                              })
                            }
                            fullWidth
                          />
                        ) : null}
                      </Stack>
                    ) : null}
                  </Stack>
                ))}
                <TextField
                  label="Добавить параметр"
                  size="small"
                  value=""
                  placeholder="Нажмите Enter чтобы добавить"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBodyParam();
                    }
                  }}
                  fullWidth
                />
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Доп. опции</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Формат массивов в query</InputLabel>
              <Select
                label="Формат массивов в query"
                value={config.options.arrayFormatInQuery}
                onChange={(e) =>
                  updateOptions({
                    arrayFormatInQuery: e.target.value as HttpRequestToolConfig["options"]["arrayFormatInQuery"],
                  })
                }
              >
                <MenuItem value="repeat">Повторять</MenuItem>
                <MenuItem value="brackets">В скобках</MenuItem>
                <MenuItem value="comma">Через запятую</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={config.options.batching.enabled}
                  onChange={(e) =>
                    updateOptions({
                      batching: {
                        ...config.options.batching,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Пакетная обработка"
            />
            {config.options.batching.enabled ? (
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Элементов в пакете"
                  size="small"
                  type="number"
                  value={config.options.batching.itemsPerBatch}
                  onChange={(e) =>
                    updateOptions({
                      batching: {
                        ...config.options.batching,
                        itemsPerBatch: Number(e.target.value),
                      },
                    })
                  }
                  sx={{ width: 160 }}
                />
                <TextField
                  label="Интервал (мс)"
                  size="small"
                  type="number"
                  value={config.options.batching.batchIntervalMs}
                  onChange={(e) =>
                    updateOptions({
                      batching: {
                        ...config.options.batching,
                        batchIntervalMs: Number(e.target.value),
                      },
                    })
                  }
                  sx={{ width: 160 }}
                />
              </Stack>
            ) : null}

            <FormControlLabel
              control={
                <Switch
                  checked={config.options.ignoreSslIssues}
                  onChange={(e) =>
                    updateOptions({ ignoreSslIssues: e.target.checked })
                  }
                />
              }
              label="Игнорировать ошибки SSL"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.options.lowercaseHeaders}
                  onChange={(e) =>
                    updateOptions({ lowercaseHeaders: e.target.checked })
                  }
                />
              }
              label="Приводить заголовки к нижнему регистру"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.options.redirects.enabled}
                  onChange={(e) =>
                    updateOptions({
                      redirects: {
                        ...config.options.redirects,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Редиректы"
            />

            {config.options.redirects.enabled ? (
              <TextField
                label="Макс. редиректов"
                size="small"
                type="number"
                value={config.options.redirects.maxRedirects}
                onChange={(e) =>
                  updateOptions({
                    redirects: {
                      ...config.options.redirects,
                      maxRedirects: Number(e.target.value),
                    },
                  })
                }
                sx={{ width: 180 }}
              />
            ) : null}

            <Typography variant="subtitle2">Ответ</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={config.options.responseOptions.includeHeaders}
                  onChange={(e) =>
                    updateOptions({
                      responseOptions: {
                        ...config.options.responseOptions,
                        includeHeaders: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Включать заголовки"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.options.responseOptions.includeStatusCode}
                  onChange={(e) =>
                    updateOptions({
                      responseOptions: {
                        ...config.options.responseOptions,
                        includeStatusCode: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Включать статус"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.options.responseOptions.neverError}
                  onChange={(e) =>
                    updateOptions({
                      responseOptions: {
                        ...config.options.responseOptions,
                        neverError: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Не считать ошибкой"
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Формат ответа</InputLabel>
              <Select
                label="Формат ответа"
                value={config.options.responseOptions.responseFormat}
                onChange={(e) =>
                  updateOptions({
                    responseOptions: {
                      ...config.options.responseOptions,
                      responseFormat: e.target.value as HttpRequestToolConfig["options"]["responseOptions"]["responseFormat"],
                    },
                  })
                }
              >
                {RESPONSE_FORMATS.map((format) => (
                  <MenuItem key={format} value={format}>
                    {format}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(config.options.responseOptions.responseFormat === "file" ||
              config.options.responseOptions.responseFormat === "text") && (
              <TextField
                label="Поле вывода"
                size="small"
                value={config.options.responseOptions.putOutputInField}
                onChange={(e) =>
                  updateOptions({
                    responseOptions: {
                      ...config.options.responseOptions,
                      putOutputInField: e.target.value,
                    },
                  })
                }
                fullWidth
              />
            )}

            <Typography variant="subtitle2">Пагинация</Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Режим</InputLabel>
              <Select
                label="Режим"
                value={config.options.pagination.mode}
                onChange={(e) =>
                  updateOptions({
                    pagination: {
                      ...config.options.pagination,
                      mode: e.target.value as HttpRequestToolConfig["options"]["pagination"]["mode"],
                    },
                  })
                }
              >
                <MenuItem value="off">Выключена</MenuItem>
                <MenuItem value="link">Link header</MenuItem>
                <MenuItem value="offset">Offset</MenuItem>
                <MenuItem value="cursor">Cursor</MenuItem>
              </Select>
            </FormControl>
            {config.options.pagination.mode !== "off" ? (
              <TextField
                label="Настройки (JSON)"
                size="small"
                multiline
                minRows={4}
                value={config.options.pagination.configJson}
                onChange={(e) =>
                  updateOptions({
                    pagination: {
                      ...config.options.pagination,
                      configJson: e.target.value,
                    },
                  })
                }
                fullWidth
              />
            ) : null}

            <TextField
              label="Прокси"
              size="small"
              value={config.options.proxy}
              onChange={(e) => updateOptions({ proxy: e.target.value })}
              fullWidth
            />

            <TextField
              label="Таймаут (мс)"
              size="small"
              type="number"
              value={config.options.timeoutMs}
              onChange={(e) =>
                updateOptions({ timeoutMs: Number(e.target.value) })
              }
              fullWidth
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Для инструмента</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.toolOnly.optimizeResponse}
                  onChange={(e) =>
                    updateToolOnly({ optimizeResponse: e.target.checked })
                  }
                />
              }
              label="Оптимизировать ответ"
            />

            {config.toolOnly.optimizeResponse ? (
              <Stack spacing={1.5}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Ожидаемый тип</InputLabel>
                  <Select
                    label="Ожидаемый тип"
                    value={config.toolOnly.optimizeResponseType}
                    onChange={(e) =>
                      updateToolOnly({
                        optimizeResponseType: e.target.value as HttpRequestToolConfig["toolOnly"]["optimizeResponseType"],
                      })
                    }
                  >
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="html">HTML</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                  </Select>
                </FormControl>

                {config.toolOnly.optimizeResponseType === "json" ? (
                  <Stack spacing={1}>
                    <TextField
                      label="Поле с данными"
                      size="small"
                      value={config.toolOnly.jsonOptimize.fieldContainingData}
                      onChange={(e) =>
                        updateToolOnly({
                          jsonOptimize: {
                            ...config.toolOnly.jsonOptimize,
                            fieldContainingData: e.target.value,
                          },
                        })
                      }
                      fullWidth
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Режим полей</InputLabel>
                      <Select
                        label="Режим полей"
                        value={config.toolOnly.jsonOptimize.includeFieldsMode}
                        onChange={(e) =>
                          updateToolOnly({
                            jsonOptimize: {
                              ...config.toolOnly.jsonOptimize,
                              includeFieldsMode: e.target.value as HttpRequestToolConfig["toolOnly"]["jsonOptimize"]["includeFieldsMode"],
                            },
                          })
                        }
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="selected">Selected</MenuItem>
                        <MenuItem value="exclude">Exclude</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Список полей (через запятую)"
                      size="small"
                      value={config.toolOnly.jsonOptimize.fieldsList.join(", ")}
                      onChange={(e) =>
                        updateToolOnly({
                          jsonOptimize: {
                            ...config.toolOnly.jsonOptimize,
                            fieldsList: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      fullWidth
                    />
                  </Stack>
                ) : null}

                {config.toolOnly.optimizeResponseType === "html" ? (
                  <Stack spacing={1}>
                    <TextField
                      label="CSS-селектор"
                      size="small"
                      value={config.toolOnly.htmlOptimize.selectorCss}
                      onChange={(e) =>
                        updateToolOnly({
                          htmlOptimize: {
                            ...config.toolOnly.htmlOptimize,
                            selectorCss: e.target.value,
                          },
                        })
                      }
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.toolOnly.htmlOptimize.returnOnlyContent}
                          onChange={(e) =>
                            updateToolOnly({
                              htmlOptimize: {
                                ...config.toolOnly.htmlOptimize,
                                returnOnlyContent: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Только содержимое"
                    />
                    <TextField
                      label="Исключить элементы"
                      size="small"
                      value={config.toolOnly.htmlOptimize.elementsToOmit}
                      onChange={(e) =>
                        updateToolOnly({
                          htmlOptimize: {
                            ...config.toolOnly.htmlOptimize,
                            elementsToOmit: e.target.value,
                          },
                        })
                      }
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.toolOnly.htmlOptimize.truncateResponse}
                          onChange={(e) =>
                            updateToolOnly({
                              htmlOptimize: {
                                ...config.toolOnly.htmlOptimize,
                                truncateResponse: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Обрезать ответ"
                    />
                    {config.toolOnly.htmlOptimize.truncateResponse ? (
                      <TextField
                        label="Макс. символов"
                        size="small"
                        type="number"
                        value={config.toolOnly.htmlOptimize.maxResponseCharacters}
                        onChange={(e) =>
                          updateToolOnly({
                            htmlOptimize: {
                              ...config.toolOnly.htmlOptimize,
                              maxResponseCharacters: Number(e.target.value),
                            },
                          })
                        }
                        fullWidth
                      />
                    ) : null}
                  </Stack>
                ) : null}

                {config.toolOnly.optimizeResponseType === "text" ? (
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.toolOnly.textOptimize.truncateResponse}
                          onChange={(e) =>
                            updateToolOnly({
                              textOptimize: {
                                ...config.toolOnly.textOptimize,
                                truncateResponse: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Обрезать ответ"
                    />
                    {config.toolOnly.textOptimize.truncateResponse ? (
                      <TextField
                        label="Макс. символов"
                        size="small"
                        type="number"
                        value={config.toolOnly.textOptimize.maxResponseCharacters}
                        onChange={(e) =>
                          updateToolOnly({
                            textOptimize: {
                              ...config.toolOnly.textOptimize,
                              maxResponseCharacters: Number(e.target.value),
                            },
                          })
                        }
                        fullWidth
                      />
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
