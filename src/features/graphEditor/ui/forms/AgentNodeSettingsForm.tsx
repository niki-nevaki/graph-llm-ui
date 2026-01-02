import {
  Autocomplete,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { AgentDefinitionNode } from "../../../../domain/workflow";
import { AGENT_MODEL_OPTIONS } from "../../model/modelOptions";

export function AgentNodeSettingsForm(props: {
  data: AgentDefinitionNode;
  onChange: (patch: Partial<AgentDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Режим</InputLabel>
        <Select
          label="Режим"
          value={data.config.mode}
          onChange={(e) => onChange({ mode: e.target.value as any })}
        >
          <MenuItem value="chat">Чат</MenuItem>
          <MenuItem value="task">Задача</MenuItem>
          <MenuItem value="planner">Планировщик</MenuItem>
        </Select>
      </FormControl>

      <Autocomplete
        options={AGENT_MODEL_OPTIONS}
        value={data.config.model || null}
        onChange={(_, value) => onChange({ model: value ?? "" })}
        autoHighlight
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            label="Модель"
            size="medium"
            placeholder="Выберите модель"
          />
        )}
      />

      <TextField
        label="Температура"
        size="medium"
        type="number"
        value={data.config.temperature}
        onChange={(e) => onChange({ temperature: Number(e.target.value) })}
        inputProps={{ step: 0.1, min: 0, max: 2 }}
        sx={{ width: 200 }}
      />

      <TextField
        label="Системный промпт"
        size="medium"
        fullWidth
        multiline
        minRows={4}
        value={data.config.system_prompt}
        onChange={(e) => onChange({ system_prompt: e.target.value })}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(data.config.use_memory)}
            onChange={(e) => onChange({ use_memory: e.target.checked })}
          />
        }
        label="Использовать память"
      />
    </Stack>
  );
}
