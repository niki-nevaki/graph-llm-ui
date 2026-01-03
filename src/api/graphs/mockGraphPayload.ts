import type { GraphExportPayload } from "../../types/graphExport";

export const MOCK_GRAPH_PAYLOAD: GraphExportPayload = {
  schemaVersion: 1,
  exportedAt: "2026-01-03T02:32:03.135Z",
  graph: {
    nodes: [
      {
        id: "1",
        type: "appNode",
        position: {
          x: 160,
          y: 120,
        },
        data: {
          id: "1",
          name: "Текст",
          enabled: true,
          meta: {
            description: "апрпарпа",
          },
          kind: "text",
          config: {
            mode: "inline",
            text: "Приветапрпар",
            fileName: "",
          },
        },
        ui: {
          selected: true,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "3",
        type: "appNode",
        position: {
          x: 842.879754012002,
          y: -9.86475389063925,
        },
        data: {
          id: "3",
          name: "Агент",
          enabled: true,
          meta: {
            description: "парпарпар",
          },
          kind: "agent",
          config: {
            mode: "task",
            model: "gpt_oss_120B",
            temperature: 0.2,
            system_prompt: "йцу",
            use_memory: false,
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "3",
        type: "appNode",
        position: {
          x: 842.879754012002,
          y: -9.86475389063925,
        },
        data: {
          id: "3",
          name: "Агент",
          enabled: true,
          meta: {
            description: "парпарпар",
          },
          kind: "agent",
          config: {
            mode: "task",
            model: "gpt_oss_120B",
            temperature: 0.2,
            system_prompt: "йцу",
            use_memory: false,
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "4",
        type: "appNode",
        position: {
          x: 361.10206189589445,
          y: 378.66417238338454,
        },
        data: {
          id: "4",
          kind: "tool",
          name: "HTTP-запроспарапр",
          enabled: true,
          meta: {
            description: "Выполняет HTTP-запрос и возвращает ответ.апрпа",
          },
          config: {
            toolId: "http_request",
            toolName: "HTTP-запрос",
            httpRequest: {
              base: {
                method: "GET",
                url: "123",
                authentication: {
                  authType: "basic",
                  credentialRef: {},
                  inlineAuth: {
                    basic: {
                      username: {
                        mode: "fixed",
                        value: "апрпар",
                        expression: "",
                        fromAI: {
                          hint: "",
                          key: "",
                          description: "",
                          type: "",
                          defaultValue: "",
                        },
                      },
                      password: {
                        mode: "fixed",
                        value: "апрпар",
                        expression: "",
                        fromAI: {
                          hint: "",
                          key: "",
                          description: "",
                          type: "",
                          defaultValue: "",
                        },
                      },
                    },
                  },
                },
              },
              query: {
                sendQueryParameters: true,
                queryParamsMode: "fields",
                queryParameters: [],
                queryParametersJson: "",
              },
              headers: {
                sendHeaders: true,
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
            },
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "4",
        type: "appNode",
        position: {
          x: 361.10206189589445,
          y: 378.66417238338454,
        },
        data: {
          id: "4",
          kind: "tool",
          name: "HTTP-запроспарапр",
          enabled: true,
          meta: {
            description: "Выполняет HTTP-запрос и возвращает ответ.апрпа",
          },
          config: {
            toolId: "http_request",
            toolName: "HTTP-запрос",
            httpRequest: {
              base: {
                method: "GET",
                url: "123",
                authentication: {
                  authType: "basic",
                  credentialRef: {},
                  inlineAuth: {
                    basic: {
                      username: {
                        mode: "fixed",
                        value: "апрпар",
                        expression: "",
                        fromAI: {
                          hint: "",
                          key: "",
                          description: "",
                          type: "",
                          defaultValue: "",
                        },
                      },
                      password: {
                        mode: "fixed",
                        value: "апрпар",
                        expression: "",
                        fromAI: {
                          hint: "",
                          key: "",
                          description: "",
                          type: "",
                          defaultValue: "",
                        },
                      },
                    },
                  },
                },
              },
              query: {
                sendQueryParameters: true,
                queryParamsMode: "fields",
                queryParameters: [],
                queryParametersJson: "",
              },
              headers: {
                sendHeaders: true,
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
            },
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "5",
        type: "appNode",
        position: {
          x: 1189.7141567838898,
          y: 27.795301866545742,
        },
        data: {
          id: "5",
          name: "Телеграм-бот",
          enabled: true,
          meta: {
            description: "пропрорпо",
          },
          kind: "tgBot",
          config: {
            direction: "inout",
            token: "прорпj",
            chatId: "прорпо",
            parseMode: "html",
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "6",
        type: "appNode",
        position: {
          x: 919.9796206446347,
          y: 268.10957744085744,
        },
        data: {
          id: "6",
          name: "парпаАгент",
          enabled: true,
          meta: {
            description: "апрпар",
          },
          kind: "agent",
          config: {
            mode: "task",
            model: "gpt_4o",
            temperature: 0.2565646456,
            system_prompt: "апрпар",
            use_memory: true,
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
      {
        id: "7",
        type: "appNode",
        position: {
          x: 1449.7141567838898,
          y: 279.79530186654574,
        },
        data: {
          id: "7",
          name: "Текстпрорпорпо",
          enabled: true,
          meta: {
            description: "прорпо",
          },
          kind: "text",
          config: {
            mode: "inline",
            text: "рпорпопорпорпо",
            fileName: "",
          },
        },
        ui: {
          selected: false,
        },
        dimensions: {
          width: null,
          height: null,
        },
      },
    ],
    edges: [
      {
        id: "edge-4-3-tool",
        source: "4",
        target: "3",
        sourceHandle: "out",
        targetHandle: "tool",
        type: "custom",
      },
      {
        id: "xy-edge__1out-3in",
        source: "1",
        target: "3",
        sourceHandle: "out",
        targetHandle: "in",
        type: "custom",
        markerEnd: {
          type: "arrowclosed",
          width: 16,
          height: 16,
          strokeWidth: 2,
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      {
        id: "xy-edge__3out-5in",
        source: "3",
        target: "5",
        sourceHandle: "out",
        targetHandle: "in",
        type: "custom",
        markerEnd: {
          type: "arrowclosed",
          width: 16,
          height: 16,
          strokeWidth: 2,
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      {
        id: "xy-edge__3out-6in",
        source: "3",
        target: "6",
        sourceHandle: "out",
        targetHandle: "in",
        type: "custom",
        markerEnd: {
          type: "arrowclosed",
          width: 16,
          height: 16,
          strokeWidth: 2,
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      {
        id: "xy-edge__4out-3in",
        source: "4",
        target: "3",
        sourceHandle: "out",
        targetHandle: "in",
        type: "custom",
        markerEnd: {
          type: "arrowclosed",
          width: 16,
          height: 16,
          strokeWidth: 2,
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      {
        id: "xy-edge__5out-7in",
        source: "5",
        target: "7",
        sourceHandle: "out",
        targetHandle: "in",
        type: "custom",
        markerEnd: {
          type: "arrowclosed",
          width: 16,
          height: 16,
          strokeWidth: 2,
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    ],
  },
  editorState: {
    viewport: {
      x: 82.91015956293745,
      y: 96.95957920902703,
      zoom: 0.5586435690361102,
    },
    selection: {
      selectedNodeIds: ["1"],
      selectedEdgeIds: [],
      activeNodeId: "1",
    },
    sidebar: {
      isOpen: true,
      activeTabId: "general",
      width: 520,
    },
    panels: {
      issuesPanel: {
        isOpen: true,
        activeTab: null,
      },
    },
    settings: {
      showFieldIssues: true,
    },
  },
};
