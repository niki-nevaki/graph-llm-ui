import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StopIcon from "@mui/icons-material/Stop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { Panel } from "@xyflow/react";

type Props = {
  hasNodes: boolean;
  isRunning: boolean;
  showFieldIssues: boolean;
  onExecute: () => void;
  onValidate: () => void;
  onStop: () => void;
  onExport: () => void;
  onLoad: () => void;
  onToggleShowFieldIssues: () => void;
};

export function GraphCanvasActions({
  hasNodes,
  isRunning,
  showFieldIssues,
  onExecute,
  onValidate,
  onStop,
  onExport,
  onLoad,
  onToggleShowFieldIssues,
}: Props) {
  return (
    <Panel
      position="top-left"
      className="nodrag nopan"
      style={{
        left: "50%",
        top: "70%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          bgcolor: "transparent",
          boxShadow: "none",
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Tooltip title="Запуск">
            <span>
              <IconButton
                size="medium"
                color="success"
                disabled={isRunning || !hasNodes}
                onClick={onExecute}
              >
                <PlayArrowIcon fontSize="medium" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Проверить">
            <span>
              <IconButton
                size="medium"
                color="info"
                disabled={isRunning || !hasNodes}
                onClick={onValidate}
              >
                <CheckCircleOutlineIcon fontSize="medium" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Поля с ошибками">
            <IconButton
              size="medium"
              color={showFieldIssues ? "primary" : "default"}
              onClick={onToggleShowFieldIssues}
            >
              <VisibilityIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Сохранить">
            <IconButton size="medium" color="default" onClick={onExport}>
              <SaveOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Загрузить">
            <IconButton
              size="medium"
              color="default"
              onClick={onLoad}
              disabled={isRunning}
            >
              <DownloadOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          {isRunning ? (
            <Tooltip title="Остановить">
              <IconButton size="medium" color="error" onClick={onStop}>
                <StopIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </Paper>
    </Panel>
  );
}
