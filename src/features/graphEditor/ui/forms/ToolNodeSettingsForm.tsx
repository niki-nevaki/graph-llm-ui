import { Box, TextField, Typography } from "@mui/material";
import type { ToolDefinitionNode } from "../../../../domain/workflow";
import { TOOL_OPTIONS } from "../../model/toolOptions";
import { HttpRequestToolForm } from "./tool/HttpRequestToolForm";
import { GoogleSheetsToolForm } from "./tool/GoogleSheetsToolForm";
import {
  buildFieldAdornment,
  buildHelperText,
  buildWarningSx,
  resolveFieldIssue,
} from "./fieldIssueUtils";
import type { Issue } from "../../model/runtime";

export function ToolNodeSettingsForm(props: {
  data: ToolDefinitionNode;
  onChange: (patch: Partial<ToolDefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, onChange, getIssue, focusFieldPath, showFieldIssues } = props;
  const toolId = data.config.toolId;
  const toolName = data.config.toolName;
  const optionById = TOOL_OPTIONS.find((option) => option.id === toolId);
  const optionByName = TOOL_OPTIONS.find((option) => option.title === toolName);
  const resolvedToolId =
    optionByName && optionById && optionByName.id !== optionById.id
      ? optionByName.id
      : optionById?.id ?? optionByName?.id ?? toolId;
  const toolIssue = resolveFieldIssue(
    getIssue("config.toolName"),
    "config.toolName",
    focusFieldPath,
    showFieldIssues,
    data.config.toolName
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Инструмент"
        size="medium"
        value={data.config.toolName}
        fullWidth
        InputProps={{
          readOnly: true,
          endAdornment: buildFieldAdornment(toolIssue),
        }}
        inputProps={{ "data-field-path": "config.toolName" }}
        error={toolIssue.isError}
        helperText={buildHelperText(toolIssue)}
        sx={buildWarningSx(toolIssue)}
      />

      {resolvedToolId === "http_request" ? (
        <HttpRequestToolForm
          data={data}
          onChange={onChange}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      ) : resolvedToolId === "google_sheets" ? (
        <GoogleSheetsToolForm
          data={data}
          onChange={onChange}
          getIssue={getIssue}
          focusFieldPath={focusFieldPath}
          showFieldIssues={showFieldIssues}
        />
      ) : (
        <Typography variant="caption" color="text.secondary">
          Метаданные инструмента будут доступны в следующем шаге.
        </Typography>
      )}
    </Box>
  );
}
