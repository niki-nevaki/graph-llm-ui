import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { LlmDefinitionNode } from "../../../../domain/workflow";
import { buildFieldAdornment, buildHelperText, buildWarningSx, resolveFieldIssue } from "./fieldIssueUtils";
import type { Issue } from "../../model/runtime";

export function LlmNodeSettingsForm(props: {
  data: LlmDefinitionNode;
  onChange: (patch: Partial<LlmDefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, onChange, getIssue, focusFieldPath, showFieldIssues } = props;
  const modelIssue = resolveFieldIssue(
    getIssue("config.model"),
    "config.model",
    focusFieldPath,
    showFieldIssues,
    data.config.model
  );

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Провайдер</InputLabel>
        <Select
          label="Провайдер"
          value={data.config.provider}
          onChange={(e) => onChange({ provider: e.target.value as any })}
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="anthropic">Anthropic</MenuItem>
          <MenuItem value="azure">Azure</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Модель"
        size="medium"
        fullWidth
        value={data.config.model}
        onChange={(e) => onChange({ model: e.target.value })}
        inputProps={{ "data-field-path": "config.model" }}
        error={modelIssue.isError}
        helperText={buildHelperText(modelIssue)}
        InputProps={{
          endAdornment: buildFieldAdornment(modelIssue),
        }}
        sx={buildWarningSx(modelIssue)}
      />

      <TextField
        label="Системный промпт"
        size="medium"
        fullWidth
        multiline
        minRows={6}
        value={data.config.systemPrompt}
        onChange={(e) => onChange({ systemPrompt: e.target.value })}
      />

      <Stack direction="row" spacing={1}>
        <TextField
          label="Температура"
          size="medium"
          type="number"
          value={data.config.temperature}
          onChange={(e) => onChange({ temperature: Number(e.target.value) })}
          sx={{ width: 180 }}
          inputProps={{ step: 0.1, min: 0, max: 2 }}
        />
        <TextField
          label="Макс. токены"
          size="medium"
          type="number"
          value={data.config.maxTokens}
          onChange={(e) => onChange({ maxTokens: Number(e.target.value) })}
          sx={{ width: 180 }}
          inputProps={{ step: 1, min: 1 }}
        />
      </Stack>
    </Stack>
  );
}
