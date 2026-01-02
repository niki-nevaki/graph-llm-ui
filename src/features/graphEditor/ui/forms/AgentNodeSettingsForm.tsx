import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { AgentDefinitionNode } from "../../../../domain/workflow";

export function AgentNodeSettingsForm(props: {
  data: AgentDefinitionNode;
  llmOptions: Array<{ id: string; name: string }>;
  onChange: (patch: Partial<AgentDefinitionNode["config"]>) => void;
}) {
  const { data, llmOptions, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Mode</InputLabel>
        <Select
          label="Mode"
          value={data.config.mode}
          onChange={(e) => onChange({ mode: e.target.value as any })}
        >
          <MenuItem value="chat">Chat</MenuItem>
          <MenuItem value="task">Task</MenuItem>
          <MenuItem value="planner">Planner</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="medium" fullWidth>
        <InputLabel>LLM node</InputLabel>
        <Select
          label="LLM node"
          value={data.config.llmNodeId}
          onChange={(e) => onChange({ llmNodeId: e.target.value as any })}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {llmOptions.map((o) => (
            <MenuItem key={o.id} value={o.id}>
              {o.name} ({o.id})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Instructions"
        size="medium"
        fullWidth
        multiline
        minRows={10}
        value={data.config.instructions}
        onChange={(e) => onChange({ instructions: e.target.value })}
      />

      <TextField
        label="Max steps"
        size="medium"
        type="number"
        value={data.config.maxSteps}
        onChange={(e) => onChange({ maxSteps: Number(e.target.value) })}
        inputProps={{ step: 1, min: 1 }}
        sx={{ width: 200 }}
      />
    </Stack>
  );
}
