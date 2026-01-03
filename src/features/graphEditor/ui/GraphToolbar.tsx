import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Badge, Box, IconButton, Stack, Tooltip } from "@mui/material";

import type { GraphRunState } from "../model/runtime";


type Props = {
  status: GraphRunState;
  hasNodes: boolean;
  errorsCount: number;
  warningsCount: number;
  showFieldIssues: boolean;
  onExecute: () => void;
  onValidate: () => void;
  onStop: () => void;
  onToggleIssues: () => void;
  onToggleShowFieldIssues: () => void;
};

export function GraphToolbar({
  status,
  hasNodes,
  errorsCount,
  warningsCount,
  showFieldIssues,
  onExecute,
  onValidate,
  onStop,
  onToggleIssues,
  onToggleShowFieldIssues,
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
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Запуск">
          <span>
            <IconButton
              color="primary"
              onClick={onExecute}
              disabled={isRunning || !hasNodes}
            >
              <PlayArrowIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Проверить">
          <span>
            <IconButton
              onClick={onValidate}
              disabled={isRunning || !hasNodes}
            >
              <CheckCircleOutlineIcon />
            </IconButton>
          </span>
        </Tooltip>
        {status === "running" ? (
          <Tooltip title="Остановить">
            <IconButton color="error" onClick={onStop}>
              <StopIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Tooltip title="Показать поля с ошибками">
          <IconButton
            color={showFieldIssues ? "primary" : "default"}
            onClick={onToggleShowFieldIssues}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Ошибки">
          <Badge
            badgeContent={errorsCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: 11,
                minWidth: 20,
                height: 20,
                border: "1px solid rgba(0,0,0,0.2)",
              },
            }}
          >
            <IconButton
              size="small"
              color={errorsCount > 0 ? "error" : "default"}
              onClick={onToggleIssues}
            >
              <ErrorOutlineIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Tooltip>
        <Tooltip title="Предупреждения">
          <Badge
            badgeContent={warningsCount}
            color="warning"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: 10,
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <IconButton
              size="small"
              color={warningsCount > 0 ? "warning" : "default"}
              onClick={onToggleIssues}
            >
              <WarningAmberIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Tooltip>
      </Stack>
    </Box>
  );
}
