import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TgBotDefinitionNode } from "../../../../domain/workflow";
import {
  buildFieldAdornment,
  buildHelperText,
  buildWarningSx,
  resolveFieldIssue,
} from "./fieldIssueUtils";
import type { Issue } from "../../model/runtime";

export function TgBotNodeSettingsForm(props: {
  data: TgBotDefinitionNode;
  onChange: (patch: Partial<TgBotDefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, onChange, getIssue, focusFieldPath, showFieldIssues } = props;
  const tokenIssue = resolveFieldIssue(
    getIssue("config.token"),
    "config.token",
    focusFieldPath,
    showFieldIssues
  );
  const chatIssue = resolveFieldIssue(
    getIssue("config.chatId"),
    "config.chatId",
    focusFieldPath,
    showFieldIssues
  );

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Направление</InputLabel>
        <Select
          label="Направление"
          value={data.config.direction}
          onChange={(e) => onChange({ direction: e.target.value as any })}
        >
          <MenuItem value="in">Вход</MenuItem>
          <MenuItem value="out">Выход</MenuItem>
          <MenuItem value="inout">Вход/Выход</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Токен бота"
        size="medium"
        fullWidth
        type="password"
        value={data.config.token}
        onChange={(e) => onChange({ token: e.target.value })}
        inputProps={{ "data-field-path": "config.token" }}
        error={tokenIssue.isError}
        helperText={buildHelperText(tokenIssue)}
        InputProps={{
          endAdornment: buildFieldAdornment(tokenIssue),
        }}
        sx={buildWarningSx(tokenIssue)}
      />

      <TextField
        label="ID чата"
        size="medium"
        fullWidth
        value={data.config.chatId}
        onChange={(e) => onChange({ chatId: e.target.value })}
        inputProps={{ "data-field-path": "config.chatId" }}
        error={chatIssue.isError}
        helperText={buildHelperText(chatIssue)}
        InputProps={{
          endAdornment: buildFieldAdornment(chatIssue),
        }}
        sx={buildWarningSx(chatIssue)}
      />

      <FormControl size="medium" fullWidth>
        <InputLabel>Режим разбора</InputLabel>
        <Select
          label="Режим разбора"
          value={data.config.parseMode}
          onChange={(e) => onChange({ parseMode: e.target.value as any })}
        >
          <MenuItem value="plain">Обычный</MenuItem>
          <MenuItem value="markdown">Markdown</MenuItem>
          <MenuItem value="html">HTML</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
