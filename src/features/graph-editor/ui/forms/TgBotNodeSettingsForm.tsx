import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TgBotNodeData } from "../../../../types/types";

export function TgBotNodeSettingsForm(props: {
  data: TgBotNodeData;
  onChange: (patch: Partial<TgBotNodeData["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Direction</InputLabel>
        <Select
          label="Direction"
          value={data.config.direction}
          onChange={(e) => onChange({ direction: e.target.value as any })}
        >
          <MenuItem value="in">In</MenuItem>
          <MenuItem value="out">Out</MenuItem>
          <MenuItem value="inout">In/Out</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Bot token"
        size="medium"
        fullWidth
        type="password"
        value={data.config.token}
        onChange={(e) => onChange({ token: e.target.value })}
      />

      <TextField
        label="Chat ID"
        size="medium"
        fullWidth
        value={data.config.chatId}
        onChange={(e) => onChange({ chatId: e.target.value })}
      />

      <FormControl size="medium" fullWidth>
        <InputLabel>Parse mode</InputLabel>
        <Select
          label="Parse mode"
          value={data.config.parseMode}
          onChange={(e) => onChange({ parseMode: e.target.value as any })}
        >
          <MenuItem value="plain">Plain</MenuItem>
          <MenuItem value="markdown">Markdown</MenuItem>
          <MenuItem value="html">HTML</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
