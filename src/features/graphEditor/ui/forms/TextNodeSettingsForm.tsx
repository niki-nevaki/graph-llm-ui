import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TextDefinitionNode } from "../../../../domain/workflow";

export function TextNodeSettingsForm(props: {
  data: TextDefinitionNode;
  onChange: (patch: Partial<TextDefinitionNode["config"]>) => void;
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
        />
      ) : (
        <TextField
          label="Имя файла"
          size="medium"
          fullWidth
          value={data.config.fileName}
          onChange={(e) => onChange({ fileName: e.target.value })}
          placeholder="пример.txt"
        />
      )}
    </Stack>
  );
}
