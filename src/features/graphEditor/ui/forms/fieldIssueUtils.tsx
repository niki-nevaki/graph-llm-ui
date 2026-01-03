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

const isValueFilled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return Boolean(value.trim());
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    const mode = (value as { mode?: string }).mode;
    if (mode === "expression") {
      return Boolean((value as { expression?: string }).expression?.trim());
    }
    if (mode === "fromAI") {
      const fromAI = (value as { fromAI?: { key?: string; description?: string; hint?: string } }).fromAI;
      return Boolean(
        fromAI?.key?.trim() || fromAI?.description?.trim() || fromAI?.hint?.trim()
      );
    }
    if (mode === "fixed") {
      return Boolean((value as { value?: string }).value?.trim());
    }
  }
  return false;
};

export const resolveFieldIssue = (
  issue: Issue | undefined,
  fieldPath: string,
  focusFieldPath: string | null,
  showFieldIssues: boolean,
  currentValue?: unknown
): FieldIssueState => {
  const hasValue = isValueFilled(currentValue);
  const show =
    Boolean(issue) &&
    !hasValue &&
    (showFieldIssues || focusFieldPath === fieldPath);
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
