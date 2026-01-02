import type {
  AgentNodeConfig,
  FieldValue,
  GoogleSheetsToolConfig,
  HttpRequestToolConfig,
  LlmNodeConfig,
  NodeConfig,
  NodeKind,
  RelDbNodeConfig,
  TextNodeConfig,
  TgBotNodeConfig,
  ToolNodeConfig,
} from "./types";

export function createDefaultNodeConfig(kind: "text"): TextNodeConfig;
export function createDefaultNodeConfig(kind: "tgBot"): TgBotNodeConfig;
export function createDefaultNodeConfig(kind: "relDb"): RelDbNodeConfig;
export function createDefaultNodeConfig(kind: "llm"): LlmNodeConfig;
export function createDefaultNodeConfig(kind: "agent"): AgentNodeConfig;
export function createDefaultNodeConfig(kind: "tool"): ToolNodeConfig;
export function createDefaultNodeConfig(kind: NodeKind): NodeConfig {
  switch (kind) {
    case "text":
      return {
        mode: "inline",
        text: "",
        fileName: "",
      } satisfies TextNodeConfig;
    case "tgBot":
      return {
        direction: "inout",
        token: "",
        chatId: "",
        parseMode: "plain",
      } satisfies TgBotNodeConfig;
    case "relDb":
      return {
        driver: "postgres",
        host: "",
        port: 5432,
        database: "",
        user: "",
        password: "",
        operation: "query",
        table: "",
      } satisfies RelDbNodeConfig;
    case "llm":
      return {
        provider: "openai",
        apiKey: "",
        model: "gpt-4o-mini",
        systemPrompt: "",
        temperature: 0.2,
        maxTokens: 512,
      } satisfies LlmNodeConfig;
    case "agent":
      return {
        mode: "task",
        model: "",
        temperature: 0.2,
        system_prompt: "",
        use_memory: false,
      } satisfies AgentNodeConfig;
    case "tool":
      return {
        toolId: "",
        toolName: "",
      } satisfies ToolNodeConfig;
  }
}

export function createDefaultFieldValue(value = ""): FieldValue {
  return { mode: "fixed", value };
}

export function createDefaultHttpRequestToolConfig(): HttpRequestToolConfig {
  return {
    base: {
      method: "GET",
      url: "",
      authentication: {
        authType: "none",
      },
    },
    query: {
      sendQueryParameters: false,
      queryParamsMode: "fields",
      queryParameters: [],
      queryParametersJson: "",
    },
    headers: {
      sendHeaders: false,
      headersMode: "fields",
      headerParameters: [],
      headerParametersJson: "",
    },
    body: {
      sendBody: false,
      bodyContentType: "json",
      bodyParameters: [],
      jsonBody: "",
      rawBody: "",
      rawContentType: "application/json",
      inputDataFieldName: "",
    },
    options: {
      arrayFormatInQuery: "repeat",
      batching: {
        enabled: false,
        itemsPerBatch: 50,
        batchIntervalMs: 0,
      },
      ignoreSslIssues: false,
      lowercaseHeaders: false,
      redirects: {
        enabled: true,
        maxRedirects: 10,
      },
      responseOptions: {
        includeHeaders: false,
        includeStatusCode: false,
        neverError: false,
        responseFormat: "autodetect",
        putOutputInField: "data",
      },
      pagination: {
        mode: "off",
        configJson: "",
      },
      proxy: "",
      timeoutMs: 0,
    },
    toolOnly: {
      optimizeResponse: false,
      optimizeResponseType: "json",
      jsonOptimize: {
        fieldContainingData: "",
        includeFieldsMode: "all",
        fieldsList: [],
      },
      htmlOptimize: {
        selectorCss: "",
        returnOnlyContent: true,
        elementsToOmit: "",
        truncateResponse: false,
        maxResponseCharacters: 0,
      },
      textOptimize: {
        truncateResponse: false,
        maxResponseCharacters: 0,
      },
    },
  };
}

export function createDefaultGoogleSheetsToolConfig(): GoogleSheetsToolConfig {
  const defaultDataLocation = {
    headerRow: createDefaultFieldValue("1"),
    firstDataRow: createDefaultFieldValue("2"),
  };

  const defaultMappingOptions = {
    cellFormat: "googleDefault" as const,
    dataLocation: defaultDataLocation,
    extraFieldsHandling: "insertNewColumns" as const,
    useAppendEndpoint: false,
  };

  return {
    meta: {
      toolName: "Google Sheets",
      toolDescription: "",
      enabled: true,
    },
    auth: {
      authType: "oauth",
      credentialRef: { credentialId: "" },
      inlineAuth: {
        oauth: {
          clientId: "",
          clientSecret: "",
          accessToken: "",
          refreshToken: "",
        },
        serviceAccount: {
          email: "",
          privateKey: "",
          impersonateUserEmail: "",
        },
      },
    },
    resource: "sheet",
    operation: "appendRow",
    selectors: {
      documentSelectMode: "byUrl",
      documentUrl: createDefaultFieldValue(),
      spreadsheetId: createDefaultFieldValue(),
      sheetSelectMode: "byName",
      sheetUrl: createDefaultFieldValue(),
      sheetId: createDefaultFieldValue(),
      sheetName: createDefaultFieldValue(),
    },
    params: {
      document: {
        createDocument: {
          title: createDefaultFieldValue(),
          sheets: [],
          options: {
            locale: createDefaultFieldValue(),
            recalculationInterval: "onChange",
          },
        },
        deleteDocument: {},
      },
      sheet: {
        appendRow: {
          mappingMode: "auto",
          dataAuto: createDefaultFieldValue("{}"),
          dataManual: [],
          options: { ...defaultMappingOptions },
        },
        upsertRow: {
          mappingMode: "auto",
          dataAuto: createDefaultFieldValue("{}"),
          dataManual: [],
          options: { ...defaultMappingOptions },
          match: {
            matchColumn: createDefaultFieldValue(),
            matchValue: createDefaultFieldValue(),
          },
          whenMultipleMatches: "first",
        },
        updateRow: {
          rowNumber: createDefaultFieldValue("1"),
          mappingMode: "auto",
          dataAuto: createDefaultFieldValue("{}"),
          dataManual: [],
          options: { ...defaultMappingOptions },
        },
        getRows: {
          filter: {
            column: createDefaultFieldValue(),
            value: createDefaultFieldValue(),
          },
          options: {
            dataLocation: { ...defaultDataLocation },
            outputFormatting: {
              general: "formatted",
              date: "text",
            },
            multipleMatches: "first",
          },
        },
        clear: {
          clearMode: "wholeSheet",
          wholeSheet: { keepFirstRow: false },
          specificRows: {
            startRow: createDefaultFieldValue("1"),
            count: createDefaultFieldValue("1"),
          },
          specificColumns: {
            startColumn: createDefaultFieldValue("A"),
            count: createDefaultFieldValue("1"),
          },
          specificRange: {
            a1Range: createDefaultFieldValue("A1"),
          },
        },
        createSheet: {
          title: createDefaultFieldValue(),
          options: {
            hidden: false,
            rightToLeft: false,
            sheetId: createDefaultFieldValue(),
            sheetIndex: createDefaultFieldValue(),
            tabColorHex: createDefaultFieldValue(),
          },
        },
        deleteSheet: {},
        deleteRowsOrColumns: {
          deleteType: "rows",
          startRow: createDefaultFieldValue("1"),
          startColumn: createDefaultFieldValue("A"),
          count: createDefaultFieldValue("1"),
        },
      },
    },
  };
}
