import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TextNodeData } from "../../../../types/types";

export function TextNodeSettingsForm(props: {
  data: TextNodeData;
  onChange: (patch: Partial<TextNodeData["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Mode</InputLabel>
        <Select
          label="Mode"
          value={data.config.mode}
          onChange={(e) => onChange({ mode: e.target.value as any })}
        >
          <MenuItem value="inline">Inline</MenuItem>
          <MenuItem value="file">File</MenuItem>
        </Select>
      </FormControl>

      {data.config.mode === "inline" ? (
        <TextField
          label="Text"
          size="medium"
          fullWidth
          multiline
          minRows={10}
          value={data.config.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      ) : (
        <TextField
          label="File name"
          size="medium"
          fullWidth
          value={data.config.fileName}
          onChange={(e) => onChange({ fileName: e.target.value })}
          placeholder="example.txt"
        />
      )}
    </Stack>
  );
}
