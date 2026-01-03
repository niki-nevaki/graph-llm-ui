import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TextDefinitionNode } from "../../../../domain/workflow";
import { buildFieldAdornment, buildHelperText, buildWarningSx, resolveFieldIssue } from "./fieldIssueUtils";
import type { Issue } from "../../model/runtime";

export function TextNodeSettingsForm(props: {
  data: TextDefinitionNode;
  onChange: (patch: Partial<TextDefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, onChange, getIssue, focusFieldPath, showFieldIssues } = props;
  const textIssue = resolveFieldIssue(
    getIssue("config.text"),
    "config.text",
    focusFieldPath,
    showFieldIssues,
    data.config.text
  );
  const fileIssue = resolveFieldIssue(
    getIssue("config.fileName"),
    "config.fileName",
    focusFieldPath,
    showFieldIssues,
    data.config.fileName
  );

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Режим</InputLabel>
        <Select
          label="Режим"
          value={data.config.mode}
          onChange={(e) => onChange({ mode: e.target.value as any })}
        >
          <MenuItem value="inline">Встроенный</MenuItem>
          <MenuItem value="file">Файл</MenuItem>
        </Select>
      </FormControl>

      {data.config.mode === "inline" ? (
        <TextField
          label="Текст"
          size="medium"
          fullWidth
          multiline
          minRows={10}
          value={data.config.text}
          onChange={(e) => onChange({ text: e.target.value })}
          inputProps={{ "data-field-path": "config.text" }}
          error={textIssue.isError}
          helperText={buildHelperText(textIssue)}
          InputProps={{
            endAdornment: buildFieldAdornment(textIssue),
          }}
          sx={buildWarningSx(textIssue)}
        />
      ) : (
        <TextField
          label="Имя файла"
          size="medium"
          fullWidth
          value={data.config.fileName}
          onChange={(e) => onChange({ fileName: e.target.value })}
          placeholder="пример.txt"
          inputProps={{ "data-field-path": "config.fileName" }}
          error={fileIssue.isError}
          helperText={buildHelperText(fileIssue)}
          InputProps={{
            endAdornment: buildFieldAdornment(fileIssue),
          }}
          sx={buildWarningSx(fileIssue)}
        />
      )}
    </Stack>
  );
}
