import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { RelDbDefinitionNode } from "../../../../domain/workflow";

export function RelDbNodeSettingsForm(props: {
  data: RelDbDefinitionNode;
  onChange: (patch: Partial<RelDbDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="medium" fullWidth>
        <InputLabel>Драйвер</InputLabel>
        <Select
          label="Драйвер"
          value={data.config.driver}
          onChange={(e) => onChange({ driver: e.target.value as any })}
        >
          <MenuItem value="postgres">Postgres</MenuItem>
          <MenuItem value="mysql">MySQL</MenuItem>
          <MenuItem value="mssql">MSSQL</MenuItem>
          <MenuItem value="sqlite">SQLite</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" spacing={1}>
        <TextField
          label="Хост"
          size="medium"
          fullWidth
          value={data.config.host}
          onChange={(e) => onChange({ host: e.target.value })}
          disabled={data.config.driver === "sqlite"}
          inputProps={{ "data-field-path": "config.host" }}
        />
        <TextField
          label="Порт"
          size="medium"
          type="number"
          value={data.config.port}
          onChange={(e) => onChange({ port: Number(e.target.value) })}
          sx={{ width: 140 }}
          disabled={data.config.driver === "sqlite"}
        />
      </Stack>

      <TextField
        label="База данных"
        size="medium"
        fullWidth
        value={data.config.database}
        onChange={(e) => onChange({ database: e.target.value })}
        disabled={data.config.driver === "sqlite"}
        inputProps={{ "data-field-path": "config.database" }}
      />

      <Stack direction="row" spacing={1}>
        <TextField
          label="Пользователь"
          size="medium"
          fullWidth
          value={data.config.user}
          onChange={(e) => onChange({ user: e.target.value })}
          disabled={data.config.driver === "sqlite"}
        />
        <TextField
          label="Пароль"
          size="medium"
          type="password"
          fullWidth
          value={data.config.password}
          onChange={(e) => onChange({ password: e.target.value })}
          disabled={data.config.driver === "sqlite"}
        />
      </Stack>

      <FormControl size="medium" fullWidth>
        <InputLabel>Операция</InputLabel>
        <Select
          label="Операция"
          value={data.config.operation}
          onChange={(e) => onChange({ operation: e.target.value as any })}
        >
          <MenuItem value="query">Запрос</MenuItem>
          <MenuItem value="select">Выборка</MenuItem>
          <MenuItem value="insert">Вставка</MenuItem>
          <MenuItem value="update">Обновление</MenuItem>
          <MenuItem value="delete">Удаление</MenuItem>
        </Select>
      </FormControl>

      {data.config.operation !== "query" ? (
        <TextField
          label="Таблица"
          size="medium"
          fullWidth
          value={data.config.table}
          onChange={(e) => onChange({ table: e.target.value })}
          placeholder="public.my_table"
          inputProps={{ "data-field-path": "config.table" }}
        />
      ) : null}
    </Stack>
  );
}
