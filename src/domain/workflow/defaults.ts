import type {
  AgentNodeConfig,
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
        sql: "SELECT 1;",
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
        fields: [],
      } satisfies ToolNodeConfig;
  }
}
