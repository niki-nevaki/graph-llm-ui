import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, InputAdornment, type SxProps } from "@mui/material";

import type { Issue } from "../../model/runtime";

export type FieldIssueState = {
  issue?: Issue;
  show: boolean;
  isError: boolean;
  isWarning: boolean;
};

export const resolveFieldIssue = (
  issue: Issue | undefined,
  fieldPath: string,
  focusFieldPath: string | null,
  showFieldIssues: boolean
): FieldIssueState => {
  const show = Boolean(issue) && (showFieldIssues || focusFieldPath === fieldPath);
  const isError = show && issue?.severity === "error";
  const isWarning = show && issue?.severity === "warning";
  return { issue, show, isError, isWarning };
};

export const buildFieldAdornment = (state: FieldIssueState) => {
  if (!state.show || (!state.isError && !state.isWarning)) return undefined;
  const Icon = state.isWarning ? WarningAmberIcon : ErrorOutlineIcon;
  const color = state.isWarning ? "warning.main" : "error.main";
  return (
    <InputAdornment position="end">
      <Icon fontSize="small" sx={{ color }} />
    </InputAdornment>
  );
};

export const buildHelperText = (state: FieldIssueState) => {
  if (!state.show || !state.issue) return undefined;
  const Icon = state.isWarning ? WarningAmberIcon : ErrorOutlineIcon;
  const color = state.isWarning ? "warning.main" : "error.main";
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color }}
    >
      <Icon fontSize="inherit" />
      {state.issue.message}
    </Box>
  );
};

export const buildWarningSx = (state: FieldIssueState): SxProps => {
  if (!state.isWarning) return {};
  return {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "warning.main",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "warning.dark",
    },
    "& .MuiFormHelperText-root": {
      color: "warning.main",
    },
  };
};
