import { Box, TextField, Typography } from "@mui/material";
import type { ToolDefinitionNode } from "../../../../domain/workflow";
import { TOOL_OPTIONS } from "../../model/toolOptions";
import { HttpRequestToolForm } from "./tool/HttpRequestToolForm";
import { GoogleSheetsToolForm } from "./tool/GoogleSheetsToolForm";

export function ToolNodeSettingsForm(props: {
  data: ToolDefinitionNode;
  onChange: (patch: Partial<ToolDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;
  const toolId = data.config.toolId;
  const toolName = data.config.toolName;
  const optionById = TOOL_OPTIONS.find((option) => option.id === toolId);
  const optionByName = TOOL_OPTIONS.find((option) => option.title === toolName);
  const resolvedToolId =
    optionByName && optionById && optionByName.id !== optionById.id
      ? optionByName.id
      : optionById?.id ?? optionByName?.id ?? toolId;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Инструмент"
        size="medium"
        value={data.config.toolName}
        fullWidth
        InputProps={{ readOnly: true }}
        inputProps={{ "data-field-path": "config.toolName" }}
      />

      {resolvedToolId === "http_request" ? (
        <HttpRequestToolForm data={data} onChange={onChange} />
      ) : resolvedToolId === "google_sheets" ? (
        <GoogleSheetsToolForm data={data} onChange={onChange} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          Метаданные инструмента будут доступны в следующем шаге.
        </Typography>
      )}
    </Box>
  );
}
