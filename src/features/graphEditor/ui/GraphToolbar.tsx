import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import type { GraphRunState } from "../model/runtime";

const STATUS_LABELS: Record<GraphRunState, string> = {
  idle: "Ожидание",
  validating: "Проверка",
  ready: "Готово",
  running: "Выполнение",
  succeeded: "Успешно",
  failed_compile: "Ошибка проверки",
  failed_runtime: "Ошибка выполнения",
  cancelled: "Отменено",
};

const STATUS_COLOR: Record<
  GraphRunState,
  "default" | "success" | "warning" | "error" | "info"
> = {
  idle: "default",
  validating: "info",
  ready: "success",
  running: "info",
  succeeded: "success",
  failed_compile: "error",
  failed_runtime: "error",
  cancelled: "warning",
};

type Props = {
  status: GraphRunState;
  errorsCount: number;
  warningsCount: number;
  missingRequired: number;
  issuesOpen: boolean;
  onExecute: () => void;
  onValidate: () => void;
  onStop: () => void;
  onToggleIssues: () => void;
};

export function GraphToolbar({
  status,
  errorsCount,
  warningsCount,
  missingRequired,
  issuesOpen,
  onExecute,
  onValidate,
  onStop,
  onToggleIssues,
}: Props) {
  const isRunning = status === "running" || status === "validating";

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onExecute}
          disabled={isRunning}
        >
          Запуск
        </Button>
        <Button
          variant="outlined"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={onValidate}
          disabled={isRunning}
        >
          Проверить
        </Button>
        {status === "running" ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={onStop}
          >
            Остановить
          </Button>
        ) : null}
      </Stack>

      <Chip
        label={STATUS_LABELS[status]}
        color={STATUS_COLOR[status]}
        size="small"
        variant="outlined"
      />

      <Box sx={{ flex: 1 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant={issuesOpen ? "contained" : "text"}
          color={errorsCount > 0 ? "error" : "inherit"}
          onClick={onToggleIssues}
        >
          Ошибки: {errorsCount}
        </Button>
        <Button
          variant={issuesOpen ? "contained" : "text"}
          color={warningsCount > 0 ? "warning" : "inherit"}
          onClick={onToggleIssues}
        >
          Предупреждения: {warningsCount}
        </Button>
        {missingRequired > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Обязательных: {missingRequired}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
