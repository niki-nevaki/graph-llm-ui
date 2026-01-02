import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { LlmDefinitionNode } from "../../../../domain/workflow";

export function LlmNodeSettingsForm(props: {
  data: LlmDefinitionNode;
  onChange: (patch: Partial<LlmDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Provider</InputLabel>
        <Select
          label="Provider"
          value={data.config.provider}
          onChange={(e) => onChange({ provider: e.target.value as any })}
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="anthropic">Anthropic</MenuItem>
          <MenuItem value="azure">Azure</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="API key"
        size="medium"
        type="password"
        fullWidth
        value={data.config.apiKey}
        onChange={(e) => onChange({ apiKey: e.target.value })}
      />

      <TextField
        label="Model"
        size="medium"
        fullWidth
        value={data.config.model}
        onChange={(e) => onChange({ model: e.target.value })}
      />

      <TextField
        label="System prompt"
        size="medium"
        fullWidth
        multiline
        minRows={6}
        value={data.config.systemPrompt}
        onChange={(e) => onChange({ systemPrompt: e.target.value })}
      />

      <Stack direction="row" spacing={1}>
        <TextField
          label="Temperature"
          size="medium"
          type="number"
          value={data.config.temperature}
          onChange={(e) => onChange({ temperature: Number(e.target.value) })}
          sx={{ width: 180 }}
          inputProps={{ step: 0.1, min: 0, max: 2 }}
        />
        <TextField
          label="Max tokens"
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
