import BuildIcon from "@mui/icons-material/Build";
import CodeIcon from "@mui/icons-material/Code";
import GridOnIcon from "@mui/icons-material/GridOn";
import HttpIcon from "@mui/icons-material/Http";
import type { ComponentType } from "react";

export type ToolOption = {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
};

export const TOOL_OPTIONS: ToolOption[] = [
  {
    id: "n8n_workflow",
    title: "n8n Workflow",
    description: "Запускает другой воркфлоу n8n как инструмент.",
    Icon: BuildIcon,
  },
  {
    id: "code_tool",
    title: "Код",
    description: "Позволяет написать инструмент на JS или Python.",
    Icon: CodeIcon,
  },
  {
    id: "http_request",
    title: "HTTP-запрос",
    description: "Выполняет HTTP-запрос и возвращает ответ.",
    Icon: HttpIcon,
  },
  {
    id: "google_sheets",
    title: "Google Sheets",
    description: "Работа с таблицами Google Sheets.",
    Icon: GridOnIcon,
  },
];
