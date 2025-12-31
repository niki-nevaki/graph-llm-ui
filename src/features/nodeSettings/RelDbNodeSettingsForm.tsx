import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { RelDbNodeData } from "../../types/types";

export function RelDbNodeSettingsForm(props: {
  data: RelDbNodeData;
  onChange: (patch: Partial<RelDbNodeData["config"]>) => void;
}) {
  const { data, onChange } = props;

  return (
    <Stack spacing={1.25}>
      <FormControl size="small" fullWidth>
        <InputLabel>Driver</InputLabel>
        <Select
          label="Driver"
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
          label="Host"
          size="small"
          fullWidth
          value={data.config.host}
          onChange={(e) => onChange({ host: e.target.value })}
          disabled={data.config.driver === "sqlite"}
        />
        <TextField
          label="Port"
          size="small"
          type="number"
          value={data.config.port}
          onChange={(e) => onChange({ port: Number(e.target.value) })}
          sx={{ width: 140 }}
          disabled={data.config.driver === "sqlite"}
        />
      </Stack>

      <TextField
        label="Database"
        size="small"
        fullWidth
        value={data.config.database}
        onChange={(e) => onChange({ database: e.target.value })}
        disabled={data.config.driver === "sqlite"}
      />

      <Stack direction="row" spacing={1}>
        <TextField
          label="User"
          size="small"
          fullWidth
          value={data.config.user}
          onChange={(e) => onChange({ user: e.target.value })}
          disabled={data.config.driver === "sqlite"}
        />
        <TextField
          label="Password"
          size="small"
          type="password"
          fullWidth
          value={data.config.password}
          onChange={(e) => onChange({ password: e.target.value })}
          disabled={data.config.driver === "sqlite"}
        />
      </Stack>

      <FormControl size="small" fullWidth>
        <InputLabel>Operation</InputLabel>
        <Select
          label="Operation"
          value={data.config.operation}
          onChange={(e) => onChange({ operation: e.target.value as any })}
        >
          <MenuItem value="query">Query</MenuItem>
          <MenuItem value="select">Select</MenuItem>
          <MenuItem value="insert">Insert</MenuItem>
          <MenuItem value="update">Update</MenuItem>
          <MenuItem value="delete">Delete</MenuItem>
        </Select>
      </FormControl>

      {data.config.operation === "query" ? (
        <TextField
          label="SQL"
          size="small"
          fullWidth
          multiline
          minRows={10}
          value={data.config.sql}
          onChange={(e) => onChange({ sql: e.target.value })}
        />
      ) : (
        <TextField
          label="Table"
          size="small"
          fullWidth
          value={data.config.table}
          onChange={(e) => onChange({ table: e.target.value })}
          placeholder="public.my_table"
        />
      )}
    </Stack>
  );
}
