import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import {
  createDefaultFieldValue,
  createDefaultGoogleSheetsToolConfig,
  type FieldValue,
  type GoogleSheetsToolConfig,
  type ToolDefinitionNode,
} from "../../../../../domain/workflow";
import type { Issue } from "../../../model/runtime";
import {
  buildFieldAdornment,
  buildHelperText,
  buildWarningSx,
  resolveFieldIssue,
} from "../fieldIssueUtils";

const RESOURCE_OPTIONS = [
  { value: "document", label: "Документ" },
  { value: "sheet", label: "Лист" },
] as const;

const DOCUMENT_OPERATIONS = [
  { value: "createDocument", label: "Создать документ" },
  { value: "deleteDocument", label: "Удалить документ" },
] as const;

const SHEET_OPERATIONS = [
  { value: "appendRow", label: "Добавить строку" },
  { value: "upsertRow", label: "Добавить/обновить строку" },
  { value: "updateRow", label: "Обновить строку" },
  { value: "getRows", label: "Получить строки" },
  { value: "clear", label: "Очистить" },
  { value: "createSheet", label: "Создать лист" },
  { value: "deleteSheet", label: "Удалить лист" },
  { value: "deleteRowsOrColumns", label: "Удалить строки или колонки" },
] as const;

const DOCUMENT_SELECT_MODES = [
  { value: "fromList", label: "Из списка" },
  { value: "byUrl", label: "По URL" },
  { value: "byId", label: "По ID" },
] as const;

const SHEET_SELECT_MODES = [
  { value: "fromList", label: "Из списка" },
  { value: "byUrl", label: "По URL" },
  { value: "byId", label: "По ID" },
  { value: "byName", label: "По имени" },
] as const;

const MAPPING_MODES = [
  { value: "auto", label: "Авто" },
  { value: "manual", label: "Вручную" },
] as const;

const CELL_FORMATS = [
  { value: "googleDefault", label: "Google (по умолчанию)" },
  { value: "systemFormat", label: "Системный формат" },
] as const;

const EXTRA_FIELDS_HANDLING = [
  { value: "insertNewColumns", label: "Добавлять новые колонки" },
  { value: "ignore", label: "Игнорировать" },
  { value: "error", label: "Ошибка" },
] as const;

const CLEAR_MODES = [
  { value: "wholeSheet", label: "Весь лист" },
  { value: "specificRows", label: "Определенные строки" },
  { value: "specificColumns", label: "Определенные колонки" },
  { value: "specificRange", label: "Диапазон A1" },
] as const;

const DELETE_TYPES = [
  { value: "rows", label: "Строки" },
  { value: "columns", label: "Колонки" },
] as const;

const OUTPUT_GENERAL_FORMATS = [
  { value: "unformatted", label: "Без форматирования" },
  { value: "formatted", label: "С форматированием" },
  { value: "formulas", label: "Формулы" },
] as const;

const OUTPUT_DATE_FORMATS = [
  { value: "text", label: "Текст" },
  { value: "serialNumber", label: "Серийный номер" },
] as const;

const MULTIPLE_MATCHES = [
  { value: "first", label: "Первая" },
  { value: "all", label: "Все" },
] as const;

const UPSERT_MATCHES = [
  { value: "first", label: "Первая" },
  { value: "all", label: "Все" },
  { value: "error", label: "Ошибка" },
] as const;

const RECALC_INTERVALS = [
  { value: "onChange", label: "При изменении" },
  { value: "minute", label: "Каждую минуту" },
  { value: "hour", label: "Каждый час" },
] as const;

const DEFAULT_VALUE_MODES = [
  { value: "fixed", label: "Фикс" },
  { value: "expression", label: "Выражение" },
  { value: "fromAI", label: "Заполнит модель ⭐" },
] as const;

const extractSpreadsheetIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
};

const extractSheetIdFromUrl = (url: string): string | null => {
  const match = url.match(/[#?]gid=([0-9]+)/);
  return match?.[1] ?? null;
};

function normalizeFieldValue(value?: FieldValue): FieldValue {
  if (!value) return createDefaultFieldValue();
  const defaultValue =
    typeof value.fromAI?.defaultValue === "string"
      ? value.fromAI?.defaultValue
      : value.fromAI?.defaultValue == null
      ? ""
      : JSON.stringify(value.fromAI?.defaultValue);
  return {
    mode: value.mode ?? "fixed",
    value: value.value ?? "",
    expression: value.expression ?? "",
    fromAI: {
      hint: value.fromAI?.hint ?? "",
      key: value.fromAI?.key ?? "",
      description: value.fromAI?.description ?? "",
      type: value.fromAI?.type ?? "",
      defaultValue,
    },
  };
}

function FieldValueInput(props: {
  label: string;
  value?: FieldValue;
  onChange: (next: FieldValue) => void;
  multiline?: boolean;
  minRows?: number;
  placeholder?: string;
  inputType?: string;
  dataFieldPath?: string;
  issueState?: ReturnType<typeof resolveFieldIssue>;
}) {
  const {
    label,
    value,
    onChange,
    multiline = false,
    minRows,
    placeholder,
    inputType,
    dataFieldPath,
    issueState,
  } = props;
  const normalized = normalizeFieldValue(value);

  const onModeChange = (mode: FieldValue["mode"]) => {
    onChange({ ...normalized, mode });
  };

  const onValueChange = (nextValue: string) => {
    if (normalized.mode === "expression") {
      onChange({ ...normalized, expression: nextValue });
      return;
    }
    if (normalized.mode === "fromAI") {
      onChange({
        ...normalized,
        fromAI: { ...normalized.fromAI, hint: nextValue },
      });
      return;
    }
    onChange({ ...normalized, value: nextValue });
  };

  const updateFromAI = (patch: NonNullable<FieldValue["fromAI"]>) => {
    onChange({
      ...normalized,
      fromAI: { ...normalized.fromAI, ...patch },
    });
  };

  const inputValue =
    normalized.mode === "expression"
      ? normalized.expression ?? ""
      : normalized.mode === "fromAI"
      ? normalized.fromAI?.hint ?? ""
      : normalized.value ?? "";

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Значение</InputLabel>
          <Select
            label="Значение"
            value={normalized.mode}
            onChange={(e) => onModeChange(e.target.value as FieldValue["mode"])}
          >
            {DEFAULT_VALUE_MODES.map((mode) => (
              <MenuItem key={mode.value} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {normalized.mode !== "fromAI" ? (
          <TextField
            label={label}
            size="small"
            fullWidth
            value={inputValue}
            onChange={(e) => onValueChange(e.target.value)}
            multiline={multiline}
            minRows={minRows}
            placeholder={placeholder}
            type={inputType}
            inputProps={
              dataFieldPath ? { "data-field-path": dataFieldPath } : undefined
            }
            error={issueState?.isError}
            helperText={issueState ? buildHelperText(issueState) : undefined}
            InputProps={{
              endAdornment: issueState ? buildFieldAdornment(issueState) : undefined,
            }}
            sx={issueState ? buildWarningSx(issueState) : undefined}
          />
        ) : null}
      </Stack>

      {normalized.mode === "fromAI" ? (
        <Stack spacing={1}>
          <TextField
            label={`${label} (ключ)`}
            size="small"
            value={normalized.fromAI?.key ?? ""}
            onChange={(e) => updateFromAI({ key: e.target.value })}
            fullWidth
          />
          <TextField
            label="Описание"
            size="small"
            value={normalized.fromAI?.description ?? ""}
            onChange={(e) => updateFromAI({ description: e.target.value })}
            fullWidth
          />
          <TextField
            label="Тип"
            size="small"
            value={normalized.fromAI?.type ?? ""}
            onChange={(e) => updateFromAI({ type: e.target.value })}
            fullWidth
          />
          <TextField
            label="Значение по умолчанию"
            size="small"
            value={normalized.fromAI?.defaultValue ?? ""}
            onChange={(e) => updateFromAI({ defaultValue: e.target.value })}
            fullWidth
          />
        </Stack>
      ) : null}
    </Stack>
  );
}

function mergeGoogleSheetsConfig(
  incoming?: GoogleSheetsToolConfig
): GoogleSheetsToolConfig {
  const defaults = createDefaultGoogleSheetsToolConfig();
  const incomingDoc = incoming?.params?.document;
  const incomingSheet = incoming?.params?.sheet;

  return {
    ...defaults,
    ...incoming,
    meta: {
      ...defaults.meta,
      ...incoming?.meta,
    },
    auth: {
      ...defaults.auth,
      ...incoming?.auth,
      credentialRef: {
        ...defaults.auth.credentialRef,
        ...incoming?.auth?.credentialRef,
      },
      inlineAuth: {
        ...defaults.auth.inlineAuth,
        ...incoming?.auth?.inlineAuth,
      },
    },
    selectors: {
      ...defaults.selectors,
      ...incoming?.selectors,
    },
    params: {
      document: {
        ...defaults.params.document,
        ...incomingDoc,
        createDocument: {
          ...defaults.params.document.createDocument,
          ...incomingDoc?.createDocument,
          sheets:
            incomingDoc?.createDocument?.sheets ??
            defaults.params.document.createDocument.sheets,
          options: {
            ...defaults.params.document.createDocument.options,
            ...incomingDoc?.createDocument?.options,
          },
        },
        deleteDocument:
          incomingDoc?.deleteDocument ?? defaults.params.document.deleteDocument,
      },
      sheet: {
        ...defaults.params.sheet,
        ...incomingSheet,
        appendRow: {
          ...defaults.params.sheet.appendRow,
          ...incomingSheet?.appendRow,
          dataManual:
            incomingSheet?.appendRow?.dataManual ??
            defaults.params.sheet.appendRow.dataManual,
          options: {
            ...defaults.params.sheet.appendRow.options,
            ...incomingSheet?.appendRow?.options,
            dataLocation: {
              ...defaults.params.sheet.appendRow.options.dataLocation,
              ...incomingSheet?.appendRow?.options?.dataLocation,
            },
          },
        },
        upsertRow: {
          ...defaults.params.sheet.upsertRow,
          ...incomingSheet?.upsertRow,
          match: {
            ...defaults.params.sheet.upsertRow.match,
            ...incomingSheet?.upsertRow?.match,
          },
          dataManual:
            incomingSheet?.upsertRow?.dataManual ??
            defaults.params.sheet.upsertRow.dataManual,
          options: {
            ...defaults.params.sheet.upsertRow.options,
            ...incomingSheet?.upsertRow?.options,
            dataLocation: {
              ...defaults.params.sheet.upsertRow.options.dataLocation,
              ...incomingSheet?.upsertRow?.options?.dataLocation,
            },
          },
        },
        updateRow: {
          ...defaults.params.sheet.updateRow,
          ...incomingSheet?.updateRow,
          dataManual:
            incomingSheet?.updateRow?.dataManual ??
            defaults.params.sheet.updateRow.dataManual,
          options: {
            ...defaults.params.sheet.updateRow.options,
            ...incomingSheet?.updateRow?.options,
            dataLocation: {
              ...defaults.params.sheet.updateRow.options.dataLocation,
              ...incomingSheet?.updateRow?.options?.dataLocation,
            },
          },
        },
        getRows: {
          ...defaults.params.sheet.getRows,
          ...incomingSheet?.getRows,
          filter: {
            ...defaults.params.sheet.getRows.filter,
            ...incomingSheet?.getRows?.filter,
          },
          options: {
            ...defaults.params.sheet.getRows.options,
            ...incomingSheet?.getRows?.options,
            dataLocation: {
              ...defaults.params.sheet.getRows.options.dataLocation,
              ...incomingSheet?.getRows?.options?.dataLocation,
            },
            outputFormatting: {
              ...defaults.params.sheet.getRows.options.outputFormatting,
              ...incomingSheet?.getRows?.options?.outputFormatting,
            },
          },
        },
        clear: {
          ...defaults.params.sheet.clear,
          ...incomingSheet?.clear,
          wholeSheet: {
            ...defaults.params.sheet.clear.wholeSheet,
            ...incomingSheet?.clear?.wholeSheet,
          },
          specificRows: {
            ...defaults.params.sheet.clear.specificRows,
            ...incomingSheet?.clear?.specificRows,
          },
          specificColumns: {
            ...defaults.params.sheet.clear.specificColumns,
            ...incomingSheet?.clear?.specificColumns,
          },
          specificRange: {
            ...defaults.params.sheet.clear.specificRange,
            ...incomingSheet?.clear?.specificRange,
          },
        },
        createSheet: {
          ...defaults.params.sheet.createSheet,
          ...incomingSheet?.createSheet,
          options: {
            ...defaults.params.sheet.createSheet.options,
            ...incomingSheet?.createSheet?.options,
          },
        },
        deleteSheet: incomingSheet?.deleteSheet ?? defaults.params.sheet.deleteSheet,
        deleteRowsOrColumns: {
          ...defaults.params.sheet.deleteRowsOrColumns,
          ...incomingSheet?.deleteRowsOrColumns,
        },
      },
    },
  };
}

export function GoogleSheetsToolForm(props: {
  data: ToolDefinitionNode;
  onChange: (patch: Partial<ToolDefinitionNode["config"]>) => void;
  getIssue: (fieldPath: string) => Issue | undefined;
  focusFieldPath: string | null;
  showFieldIssues: boolean;
}) {
  const { data, onChange, getIssue, focusFieldPath, showFieldIssues } = props;
  const config = useMemo(
    () => mergeGoogleSheetsConfig(data.config.googleSheets),
    [data.config.googleSheets]
  );

  const updateConfig = (next: GoogleSheetsToolConfig) => {
    onChange({ googleSheets: next });
  };

  const updateAuth = (patch: Partial<GoogleSheetsToolConfig["auth"]>) => {
    updateConfig({
      ...config,
      auth: {
        ...config.auth,
        ...patch,
        credentialRef: {
          ...config.auth.credentialRef,
          ...patch.credentialRef,
        },
        inlineAuth: {
          ...config.auth.inlineAuth,
          ...patch.inlineAuth,
        },
      },
    });
  };

  const updateSelectors = (
    patch: Partial<GoogleSheetsToolConfig["selectors"]>
  ) => {
    updateConfig({
      ...config,
      selectors: { ...config.selectors, ...patch },
    });
  };

  const updateParams = (
    patch: Partial<GoogleSheetsToolConfig["params"]>
  ) => {
    updateConfig({
      ...config,
      params: { ...config.params, ...patch },
    });
  };

  const updateDocumentParams = (
    patch: Partial<GoogleSheetsToolConfig["params"]["document"]>
  ) => {
    updateParams({
      document: { ...config.params.document, ...patch },
    });
  };

  const updateSheetParams = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]>
  ) => {
    updateParams({
      sheet: { ...config.params.sheet, ...patch },
    });
  };

  const updateCreateDocument = (
    patch: Partial<GoogleSheetsToolConfig["params"]["document"]["createDocument"]>
  ) => {
    updateDocumentParams({
      createDocument: {
        ...config.params.document.createDocument,
        ...patch,
        options: {
          ...config.params.document.createDocument.options,
          ...patch.options,
        },
      },
    });
  };

  const updateAppendRow = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["appendRow"]>
  ) => {
    const current = config.params.sheet.appendRow;
    updateSheetParams({
      appendRow: {
        ...current,
        ...patch,
        options: {
          ...current.options,
          ...patch.options,
          dataLocation: {
            ...current.options.dataLocation,
            ...patch.options?.dataLocation,
          },
        },
      },
    });
  };

  const updateUpsertRow = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["upsertRow"]>
  ) => {
    const current = config.params.sheet.upsertRow;
    updateSheetParams({
      upsertRow: {
        ...current,
        ...patch,
        match: {
          ...current.match,
          ...patch.match,
        },
        options: {
          ...current.options,
          ...patch.options,
          dataLocation: {
            ...current.options.dataLocation,
            ...patch.options?.dataLocation,
          },
        },
      },
    });
  };

  const updateUpdateRow = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["updateRow"]>
  ) => {
    const current = config.params.sheet.updateRow;
    updateSheetParams({
      updateRow: {
        ...current,
        ...patch,
        options: {
          ...current.options,
          ...patch.options,
          dataLocation: {
            ...current.options.dataLocation,
            ...patch.options?.dataLocation,
          },
        },
      },
    });
  };

  const updateGetRows = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["getRows"]>
  ) => {
    const current = config.params.sheet.getRows;
    updateSheetParams({
      getRows: {
        ...current,
        ...patch,
        filter: {
          ...current.filter,
          ...patch.filter,
        },
        options: {
          ...current.options,
          ...patch.options,
          dataLocation: {
            ...current.options.dataLocation,
            ...patch.options?.dataLocation,
          },
          outputFormatting: {
            ...current.options.outputFormatting,
            ...patch.options?.outputFormatting,
          },
        },
      },
    });
  };

  const updateClear = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["clear"]>
  ) => {
    const current = config.params.sheet.clear;
    updateSheetParams({
      clear: {
        ...current,
        ...patch,
        wholeSheet: {
          ...current.wholeSheet,
          ...patch.wholeSheet,
        },
        specificRows: {
          ...current.specificRows,
          ...patch.specificRows,
        },
        specificColumns: {
          ...current.specificColumns,
          ...patch.specificColumns,
        },
        specificRange: {
          ...current.specificRange,
          ...patch.specificRange,
        },
      },
    });
  };

  const updateCreateSheet = (
    patch: Partial<GoogleSheetsToolConfig["params"]["sheet"]["createSheet"]>
  ) => {
    const current = config.params.sheet.createSheet;
    updateSheetParams({
      createSheet: {
        ...current,
        ...patch,
        options: {
          ...current.options,
          ...patch.options,
        },
      },
    });
  };

  const updateDeleteRowsOrColumns = (
    patch: Partial<
      GoogleSheetsToolConfig["params"]["sheet"]["deleteRowsOrColumns"]
    >
  ) => {
    updateSheetParams({
      deleteRowsOrColumns: {
        ...config.params.sheet.deleteRowsOrColumns,
        ...patch,
      },
    });
  };

  const operationOptions =
    config.resource === "document" ? DOCUMENT_OPERATIONS : SHEET_OPERATIONS;

  const showSheetSelectors =
    config.resource === "sheet" && config.operation !== "createSheet";

  const resourceIssue = resolveFieldIssue(
    getIssue("config.googleSheets.resource"),
    "config.googleSheets.resource",
    focusFieldPath,
    showFieldIssues
  );
  const operationIssue = resolveFieldIssue(
    getIssue("config.googleSheets.operation"),
    "config.googleSheets.operation",
    focusFieldPath,
    showFieldIssues
  );
  const documentUrlIssue = resolveFieldIssue(
    getIssue("config.googleSheets.selectors.documentUrl"),
    "config.googleSheets.selectors.documentUrl",
    focusFieldPath,
    showFieldIssues
  );
  const documentIdIssue = resolveFieldIssue(
    getIssue("config.googleSheets.selectors.spreadsheetId"),
    "config.googleSheets.selectors.spreadsheetId",
    focusFieldPath,
    showFieldIssues
  );
  const sheetUrlIssue = resolveFieldIssue(
    getIssue("config.googleSheets.selectors.sheetUrl"),
    "config.googleSheets.selectors.sheetUrl",
    focusFieldPath,
    showFieldIssues
  );
  const sheetIdIssue = resolveFieldIssue(
    getIssue("config.googleSheets.selectors.sheetId"),
    "config.googleSheets.selectors.sheetId",
    focusFieldPath,
    showFieldIssues
  );
  const sheetNameIssue = resolveFieldIssue(
    getIssue("config.googleSheets.selectors.sheetName"),
    "config.googleSheets.selectors.sheetName",
    focusFieldPath,
    showFieldIssues
  );

  const applyDocumentIdFromUrl = () => {
    const url = normalizeFieldValue(config.selectors.documentUrl).value ?? "";
    const spreadsheetId = extractSpreadsheetIdFromUrl(url);
    if (!spreadsheetId) return;
    updateSelectors({
      spreadsheetId: createDefaultFieldValue(spreadsheetId),
    });
  };

  const applySheetIdFromUrl = () => {
    const url = normalizeFieldValue(config.selectors.sheetUrl).value ?? "";
    const sheetId = extractSheetIdFromUrl(url);
    if (!sheetId) return;
    updateSelectors({
      sheetId: createDefaultFieldValue(sheetId),
    });
  };

  const renderDocumentParams = () => {
    if (config.operation === "createDocument") {
      const docParams = config.params.document.createDocument;
      return (
        <Stack spacing={1.5}>
          <FieldValueInput
            label="Название документа"
            value={docParams.title}
            onChange={(value) => updateCreateDocument({ title: value })}
          />
          <Typography variant="subtitle2">Листы</Typography>
          <Stack spacing={1}>
            {docParams.sheets.map((sheet, index) => (
              <Stack direction="row" spacing={1} key={`sheet-${index}`}>
                <FieldValueInput
                  label={`Лист ${index + 1}`}
                  value={sheet}
                  onChange={(value) => {
                    const next = docParams.sheets.map((item, i) =>
                      i === index ? value : item
                    );
                    updateCreateDocument({ sheets: next });
                  }}
                />
                <IconButton
                  aria-label="Удалить лист"
                  onClick={() => {
                    const next = docParams.sheets.filter((_, i) => i !== index);
                    updateCreateDocument({ sheets: next });
                  }}
                  sx={{ alignSelf: "center" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                updateCreateDocument({
                  sheets: docParams.sheets.concat(createDefaultFieldValue()),
                })
              }
            >
              Добавить лист
            </Button>
          </Stack>
          <Typography variant="subtitle2">Опции</Typography>
          <FieldValueInput
            label="Локаль"
            value={docParams.options.locale}
            onChange={(value) =>
              updateCreateDocument({
                options: { ...docParams.options, locale: value },
              })
            }
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Пересчет</InputLabel>
            <Select
              label="Пересчет"
              value={docParams.options.recalculationInterval ?? "onChange"}
              onChange={(e) =>
                updateCreateDocument({
                  options: {
                    ...docParams.options,
                    recalculationInterval: e.target.value as GoogleSheetsToolConfig["params"]["document"]["createDocument"]["options"]["recalculationInterval"],
                  },
                })
              }
            >
              {RECALC_INTERVALS.map((interval) => (
                <MenuItem key={interval.value} value={interval.value}>
                  {interval.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        Параметры не требуются.
      </Typography>
    );
  };

  const renderMappingParams = (
    params: GoogleSheetsToolConfig["params"]["sheet"]["appendRow"],
    onChange: (next: GoogleSheetsToolConfig["params"]["sheet"]["appendRow"]) => void
  ) => {
    return (
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel>Режим маппинга</InputLabel>
          <Select
            label="Режим маппинга"
            value={params.mappingMode}
            onChange={(e) =>
              onChange({
                ...params,
                mappingMode: e.target.value as typeof params.mappingMode,
              })
            }
          >
            {MAPPING_MODES.map((mode) => (
              <MenuItem key={mode.value} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {params.mappingMode === "auto" ? (
          <FieldValueInput
            label="Данные (JSON)"
            value={params.dataAuto}
            onChange={(value) => onChange({ ...params, dataAuto: value })}
            multiline
            minRows={4}
            placeholder='{"column":"value"}'
          />
        ) : (
          <Stack spacing={1}>
            {params.dataManual.map((row, index) => (
              <Stack key={`manual-${index}`} spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FieldValueInput
                    label="Колонка"
                    value={row.column}
                    onChange={(value) => {
                      const nextRows = params.dataManual.map((item, i) =>
                        i === index ? { ...item, column: value } : item
                      );
                      onChange({ ...params, dataManual: nextRows });
                    }}
                  />
                  <IconButton
                    aria-label="Удалить"
                    onClick={() => {
                      const nextRows = params.dataManual.filter((_, i) => i !== index);
                      onChange({ ...params, dataManual: nextRows });
                    }}
                    sx={{ alignSelf: "center" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <FieldValueInput
                  label="Значение"
                  value={row.value}
                  onChange={(value) => {
                    const nextRows = params.dataManual.map((item, i) =>
                      i === index ? { ...item, value } : item
                    );
                    onChange({ ...params, dataManual: nextRows });
                  }}
                />
              </Stack>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                onChange({
                  ...params,
                  dataManual: params.dataManual.concat({
                    column: createDefaultFieldValue(),
                    value: createDefaultFieldValue(),
                  }),
                })
              }
            >
              Добавить поле
            </Button>
          </Stack>
        )}

        <Typography variant="subtitle2">Опции</Typography>
        <FormControl size="small" fullWidth>
          <InputLabel>Формат ячеек</InputLabel>
          <Select
            label="Формат ячеек"
            value={params.options.cellFormat ?? "googleDefault"}
            onChange={(e) =>
              onChange({
                ...params,
                options: {
                  ...params.options,
                  cellFormat: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["appendRow"]["options"]["cellFormat"],
                },
              })
            }
          >
            {CELL_FORMATS.map((format) => (
              <MenuItem key={format.value} value={format.value}>
                {format.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={1}>
          <FieldValueInput
            label="Строка заголовков"
            value={params.options.dataLocation.headerRow}
            onChange={(value) =>
              onChange({
                ...params,
                options: {
                  ...params.options,
                  dataLocation: {
                    ...params.options.dataLocation,
                    headerRow: value,
                  },
                },
              })
            }
            inputType="number"
          />
          <FieldValueInput
            label="Первая строка данных"
            value={params.options.dataLocation.firstDataRow}
            onChange={(value) =>
              onChange({
                ...params,
                options: {
                  ...params.options,
                  dataLocation: {
                    ...params.options.dataLocation,
                    firstDataRow: value,
                  },
                },
              })
            }
            inputType="number"
          />
        </Stack>
        <FormControl size="small" fullWidth>
          <InputLabel>Доп. поля</InputLabel>
          <Select
            label="Доп. поля"
            value={params.options.extraFieldsHandling ?? "insertNewColumns"}
            onChange={(e) =>
              onChange({
                ...params,
                options: {
                  ...params.options,
                  extraFieldsHandling: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["appendRow"]["options"]["extraFieldsHandling"],
                },
              })
            }
          >
            {EXTRA_FIELDS_HANDLING.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(params.options.useAppendEndpoint)}
              onChange={(e) =>
                onChange({
                  ...params,
                  options: {
                    ...params.options,
                    useAppendEndpoint: e.target.checked,
                  },
                })
              }
            />
          }
          label="Использовать append endpoint"
        />
      </Stack>
    );
  };

  const renderSheetParams = () => {
    const sheetParams = config.params.sheet;

    if (config.operation === "appendRow") {
      return renderMappingParams(sheetParams.appendRow, updateAppendRow);
    }

    if (config.operation === "upsertRow") {
      return (
        <Stack spacing={1.5}>
          {renderMappingParams(sheetParams.upsertRow, (next) =>
            updateUpsertRow(next)
          )}
          <Typography variant="subtitle2">Совпадение</Typography>
          <FieldValueInput
            label="Колонка"
            value={sheetParams.upsertRow.match.matchColumn}
            onChange={(value) =>
              updateUpsertRow({
                match: { ...sheetParams.upsertRow.match, matchColumn: value },
              })
            }
          />
          <FieldValueInput
            label="Значение"
            value={sheetParams.upsertRow.match.matchValue}
            onChange={(value) =>
              updateUpsertRow({
                match: { ...sheetParams.upsertRow.match, matchValue: value },
              })
            }
          />
          <FormControl size="small" fullWidth>
            <InputLabel>При совпадениях</InputLabel>
            <Select
              label="При совпадениях"
              value={sheetParams.upsertRow.whenMultipleMatches}
              onChange={(e) =>
                updateUpsertRow({
                  whenMultipleMatches: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["upsertRow"]["whenMultipleMatches"],
                })
              }
            >
              {UPSERT_MATCHES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      );
    }

    if (config.operation === "updateRow") {
      return (
        <Stack spacing={1.5}>
          <FieldValueInput
            label="Номер строки"
            value={sheetParams.updateRow.rowNumber}
            onChange={(value) => updateUpdateRow({ rowNumber: value })}
            inputType="number"
          />
          {renderMappingParams(sheetParams.updateRow, updateUpdateRow)}
        </Stack>
      );
    }

    if (config.operation === "getRows") {
      return (
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Фильтр</Typography>
          <FieldValueInput
            label="Колонка"
            value={sheetParams.getRows.filter.column}
            onChange={(value) =>
              updateGetRows({
                filter: { ...sheetParams.getRows.filter, column: value },
              })
            }
          />
          <FieldValueInput
            label="Значение"
            value={sheetParams.getRows.filter.value}
            onChange={(value) =>
              updateGetRows({
                filter: { ...sheetParams.getRows.filter, value },
              })
            }
          />
          <Typography variant="subtitle2">Опции</Typography>
          <Stack direction="row" spacing={1}>
            <FieldValueInput
              label="Строка заголовков"
              value={sheetParams.getRows.options.dataLocation.headerRow}
              onChange={(value) =>
                updateGetRows({
                  options: {
                    ...sheetParams.getRows.options,
                    dataLocation: {
                      ...sheetParams.getRows.options.dataLocation,
                      headerRow: value,
                    },
                  },
                })
              }
              inputType="number"
            />
            <FieldValueInput
              label="Первая строка данных"
              value={sheetParams.getRows.options.dataLocation.firstDataRow}
              onChange={(value) =>
                updateGetRows({
                  options: {
                    ...sheetParams.getRows.options,
                    dataLocation: {
                      ...sheetParams.getRows.options.dataLocation,
                      firstDataRow: value,
                    },
                  },
                })
              }
              inputType="number"
            />
          </Stack>
          <FormControl size="small" fullWidth>
            <InputLabel>Формат вывода</InputLabel>
            <Select
              label="Формат вывода"
              value={sheetParams.getRows.options.outputFormatting.general ?? "formatted"}
              onChange={(e) =>
                updateGetRows({
                  options: {
                    ...sheetParams.getRows.options,
                    outputFormatting: {
                      ...sheetParams.getRows.options.outputFormatting,
                      general: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["getRows"]["options"]["outputFormatting"]["general"],
                    },
                  },
                })
              }
            >
              {OUTPUT_GENERAL_FORMATS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Формат даты</InputLabel>
            <Select
              label="Формат даты"
              value={sheetParams.getRows.options.outputFormatting.date ?? "text"}
              onChange={(e) =>
                updateGetRows({
                  options: {
                    ...sheetParams.getRows.options,
                    outputFormatting: {
                      ...sheetParams.getRows.options.outputFormatting,
                      date: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["getRows"]["options"]["outputFormatting"]["date"],
                    },
                  },
                })
              }
            >
              {OUTPUT_DATE_FORMATS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Совпадения</InputLabel>
            <Select
              label="Совпадения"
              value={sheetParams.getRows.options.multipleMatches ?? "first"}
              onChange={(e) =>
                updateGetRows({
                  options: {
                    ...sheetParams.getRows.options,
                    multipleMatches: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["getRows"]["options"]["multipleMatches"],
                  },
                })
              }
            >
              {MULTIPLE_MATCHES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      );
    }

    if (config.operation === "clear") {
      return (
        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>Режим</InputLabel>
            <Select
              label="Режим"
              value={sheetParams.clear.clearMode}
              onChange={(e) =>
                updateClear({
                  clearMode: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["clear"]["clearMode"],
                })
              }
            >
              {CLEAR_MODES.map((mode) => (
                <MenuItem key={mode.value} value={mode.value}>
                  {mode.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {sheetParams.clear.clearMode === "wholeSheet" ? (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(sheetParams.clear.wholeSheet.keepFirstRow)}
                  onChange={(e) =>
                    updateClear({
                      wholeSheet: {
                        ...sheetParams.clear.wholeSheet,
                        keepFirstRow: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Оставить первую строку"
            />
          ) : null}
          {sheetParams.clear.clearMode === "specificRows" ? (
            <Stack direction="row" spacing={1}>
              <FieldValueInput
                label="Стартовая строка"
                value={sheetParams.clear.specificRows.startRow}
                onChange={(value) =>
                  updateClear({
                    specificRows: { ...sheetParams.clear.specificRows, startRow: value },
                  })
                }
                inputType="number"
              />
              <FieldValueInput
                label="Количество"
                value={sheetParams.clear.specificRows.count}
                onChange={(value) =>
                  updateClear({
                    specificRows: { ...sheetParams.clear.specificRows, count: value },
                  })
                }
                inputType="number"
              />
            </Stack>
          ) : null}
          {sheetParams.clear.clearMode === "specificColumns" ? (
            <Stack direction="row" spacing={1}>
              <FieldValueInput
                label="Стартовая колонка"
                value={sheetParams.clear.specificColumns.startColumn}
                onChange={(value) =>
                  updateClear({
                    specificColumns: {
                      ...sheetParams.clear.specificColumns,
                      startColumn: value,
                    },
                  })
                }
              />
              <FieldValueInput
                label="Количество"
                value={sheetParams.clear.specificColumns.count}
                onChange={(value) =>
                  updateClear({
                    specificColumns: {
                      ...sheetParams.clear.specificColumns,
                      count: value,
                    },
                  })
                }
                inputType="number"
              />
            </Stack>
          ) : null}
          {sheetParams.clear.clearMode === "specificRange" ? (
            <FieldValueInput
              label="Диапазон A1"
              value={sheetParams.clear.specificRange.a1Range}
              onChange={(value) =>
                updateClear({
                  specificRange: { a1Range: value },
                })
              }
            />
          ) : null}
        </Stack>
      );
    }

    if (config.operation === "createSheet") {
      return (
        <Stack spacing={1.5}>
          <FieldValueInput
            label="Название листа"
            value={sheetParams.createSheet.title}
            onChange={(value) => updateCreateSheet({ title: value })}
          />
          <Typography variant="subtitle2">Опции</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(sheetParams.createSheet.options.hidden)}
                onChange={(e) =>
                  updateCreateSheet({
                    options: {
                      ...sheetParams.createSheet.options,
                      hidden: e.target.checked,
                    },
                  })
                }
              />
            }
            label="Скрытый лист"
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(sheetParams.createSheet.options.rightToLeft)}
                onChange={(e) =>
                  updateCreateSheet({
                    options: {
                      ...sheetParams.createSheet.options,
                      rightToLeft: e.target.checked,
                    },
                  })
                }
              />
            }
            label="Справа налево"
          />
          <Stack direction="row" spacing={1}>
            <FieldValueInput
              label="ID листа"
              value={sheetParams.createSheet.options.sheetId}
              onChange={(value) =>
                updateCreateSheet({
                  options: { ...sheetParams.createSheet.options, sheetId: value },
                })
              }
              inputType="number"
            />
            <FieldValueInput
              label="Позиция"
              value={sheetParams.createSheet.options.sheetIndex}
              onChange={(value) =>
                updateCreateSheet({
                  options: { ...sheetParams.createSheet.options, sheetIndex: value },
                })
              }
              inputType="number"
            />
          </Stack>
          <FieldValueInput
            label="Цвет вкладки (hex)"
            value={sheetParams.createSheet.options.tabColorHex}
            onChange={(value) =>
              updateCreateSheet({
                options: { ...sheetParams.createSheet.options, tabColorHex: value },
              })
            }
          />
        </Stack>
      );
    }

    if (config.operation === "deleteSheet") {
      return (
        <Typography variant="body2" color="text.secondary">
          Параметры не требуются.
        </Typography>
      );
    }

    if (config.operation === "deleteRowsOrColumns") {
      return (
        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>Тип</InputLabel>
            <Select
              label="Тип"
              value={sheetParams.deleteRowsOrColumns.deleteType}
              onChange={(e) =>
                updateDeleteRowsOrColumns({
                  deleteType: e.target.value as GoogleSheetsToolConfig["params"]["sheet"]["deleteRowsOrColumns"]["deleteType"],
                })
              }
            >
              {DELETE_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {sheetParams.deleteRowsOrColumns.deleteType === "rows" ? (
            <FieldValueInput
              label="Стартовая строка"
              value={sheetParams.deleteRowsOrColumns.startRow}
              onChange={(value) =>
                updateDeleteRowsOrColumns({ startRow: value })
              }
              inputType="number"
            />
          ) : (
            <FieldValueInput
              label="Стартовая колонка"
              value={sheetParams.deleteRowsOrColumns.startColumn}
              onChange={(value) =>
                updateDeleteRowsOrColumns({ startColumn: value })
              }
            />
          )}
          <FieldValueInput
            label="Количество"
            value={sheetParams.deleteRowsOrColumns.count}
            onChange={(value) => updateDeleteRowsOrColumns({ count: value })}
            inputType="number"
          />
        </Stack>
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        Параметры не требуются.
      </Typography>
    );
  };

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Typography variant="subtitle2">Доступ</Typography>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel>Способ</InputLabel>
          <Select
            label="Способ"
            value={config.auth.authType}
            onChange={(e) =>
              updateAuth({
                authType: e.target.value as GoogleSheetsToolConfig["auth"]["authType"],
              })
            }
          >
            <MenuItem value="oauth">OAuth</MenuItem>
            <MenuItem value="serviceAccount">Service Account</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="ID учетных данных"
          size="small"
          value={config.auth.credentialRef?.credentialId ?? ""}
          onChange={(e) =>
            updateAuth({
              credentialRef: {
                credentialId: e.target.value,
              },
            })
          }
          fullWidth
        />
        {config.auth.authType === "oauth" ? (
          <Stack spacing={1}>
            <TextField
              label="ID клиента"
              size="small"
              value={config.auth.inlineAuth?.oauth?.clientId ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    oauth: {
                      ...config.auth.inlineAuth?.oauth,
                      clientId: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Секрет клиента"
              size="small"
              value={config.auth.inlineAuth?.oauth?.clientSecret ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    oauth: {
                      ...config.auth.inlineAuth?.oauth,
                      clientSecret: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Токен доступа"
              size="small"
              value={config.auth.inlineAuth?.oauth?.accessToken ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    oauth: {
                      ...config.auth.inlineAuth?.oauth,
                      accessToken: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Токен обновления"
              size="small"
              value={config.auth.inlineAuth?.oauth?.refreshToken ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    oauth: {
                      ...config.auth.inlineAuth?.oauth,
                      refreshToken: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
          </Stack>
        ) : null}
        {config.auth.authType === "serviceAccount" ? (
          <Stack spacing={1}>
            <TextField
              label="Email"
              size="small"
              value={config.auth.inlineAuth?.serviceAccount?.email ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    serviceAccount: {
                      ...config.auth.inlineAuth?.serviceAccount,
                      email: e.target.value,
                      privateKey:
                        config.auth.inlineAuth?.serviceAccount?.privateKey ?? "",
                      impersonateUserEmail:
                        config.auth.inlineAuth?.serviceAccount
                          ?.impersonateUserEmail ?? "",
                    },
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Приватный ключ"
              size="small"
              value={config.auth.inlineAuth?.serviceAccount?.privateKey ?? ""}
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    serviceAccount: {
                      ...config.auth.inlineAuth?.serviceAccount,
                      email:
                        config.auth.inlineAuth?.serviceAccount?.email ?? "",
                      privateKey: e.target.value,
                      impersonateUserEmail:
                        config.auth.inlineAuth?.serviceAccount
                          ?.impersonateUserEmail ?? "",
                    },
                  },
                })
              }
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Пользователь для имперсонации"
              size="small"
              value={
                config.auth.inlineAuth?.serviceAccount?.impersonateUserEmail ??
                ""
              }
              onChange={(e) =>
                updateAuth({
                  inlineAuth: {
                    ...config.auth.inlineAuth,
                    serviceAccount: {
                      ...config.auth.inlineAuth?.serviceAccount,
                      email:
                        config.auth.inlineAuth?.serviceAccount?.email ?? "",
                      privateKey:
                        config.auth.inlineAuth?.serviceAccount?.privateKey ?? "",
                      impersonateUserEmail: e.target.value,
                    },
                  },
                })
              }
              fullWidth
            />
          </Stack>
        ) : null}
      </Stack>

      <Typography variant="subtitle2">Ресурс</Typography>
      <FormControl size="small" fullWidth error={resourceIssue.isError}>
        <InputLabel>Тип</InputLabel>
        <Select
          label="Тип"
          value={config.resource}
          onChange={(e) => {
            const nextResource = e.target.value as GoogleSheetsToolConfig["resource"];
            updateConfig({
              ...config,
              resource: nextResource,
              operation:
                nextResource === "document"
                  ? "createDocument"
                  : "appendRow",
            });
          }}
          inputProps={{ "data-field-path": "config.googleSheets.resource" }}
          sx={buildWarningSx(resourceIssue)}
        >
          {RESOURCE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {resourceIssue.show ? (
          <FormHelperText>{buildHelperText(resourceIssue)}</FormHelperText>
        ) : null}
      </FormControl>

      <Typography variant="subtitle2">Операция</Typography>
      <FormControl size="small" fullWidth error={operationIssue.isError}>
        <InputLabel>Операция</InputLabel>
        <Select
          label="Операция"
          value={config.operation}
          onChange={(e) =>
            updateConfig({
              ...config,
              operation: e.target.value as GoogleSheetsToolConfig["operation"],
            })
          }
          inputProps={{ "data-field-path": "config.googleSheets.operation" }}
          sx={buildWarningSx(operationIssue)}
        >
          {operationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {operationIssue.show ? (
          <FormHelperText>{buildHelperText(operationIssue)}</FormHelperText>
        ) : null}
      </FormControl>

      <Typography variant="subtitle2">Документ</Typography>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel>Режим выбора</InputLabel>
          <Select
            label="Режим выбора"
            value={config.selectors.documentSelectMode}
            onChange={(e) =>
              updateSelectors({
                documentSelectMode: e.target.value as GoogleSheetsToolConfig["selectors"]["documentSelectMode"],
              })
            }
          >
            {DOCUMENT_SELECT_MODES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {config.selectors.documentSelectMode === "byUrl" ? (
          <Stack spacing={1}>
            <FieldValueInput
              label="URL документа"
              value={config.selectors.documentUrl}
              onChange={(value) => updateSelectors({ documentUrl: value })}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              dataFieldPath="config.googleSheets.selectors.documentUrl"
              issueState={documentUrlIssue}
            />
            <Button variant="outlined" onClick={applyDocumentIdFromUrl}>
              Извлечь ID из URL
            </Button>
          </Stack>
        ) : null}

        {config.selectors.documentSelectMode === "byId" ? (
          <FieldValueInput
            label="ID документа"
            value={config.selectors.spreadsheetId}
            onChange={(value) => updateSelectors({ spreadsheetId: value })}
            dataFieldPath="config.googleSheets.selectors.spreadsheetId"
            issueState={documentIdIssue}
          />
        ) : null}

        {config.selectors.documentSelectMode === "fromList" ? (
          <FieldValueInput
            label="Документ (из списка)"
            value={config.selectors.spreadsheetId}
            onChange={(value) => updateSelectors({ spreadsheetId: value })}
            placeholder="Пока без данных"
            dataFieldPath="config.googleSheets.selectors.spreadsheetId"
            issueState={documentIdIssue}
          />
        ) : null}
      </Stack>

      {showSheetSelectors ? (
        <>
          <Typography variant="subtitle2">Лист</Typography>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Режим выбора</InputLabel>
              <Select
                label="Режим выбора"
                value={config.selectors.sheetSelectMode ?? "byName"}
                onChange={(e) =>
                  updateSelectors({
                    sheetSelectMode: e.target.value as NonNullable<GoogleSheetsToolConfig["selectors"]["sheetSelectMode"]>,
                  })
                }
              >
                {SHEET_SELECT_MODES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {config.selectors.sheetSelectMode === "byUrl" ? (
              <Stack spacing={1}>
                <FieldValueInput
                  label="URL листа"
                  value={config.selectors.sheetUrl}
                  onChange={(value) => updateSelectors({ sheetUrl: value })}
                  placeholder="https://docs.google.com/spreadsheets/d/...#gid=..."
                  dataFieldPath="config.googleSheets.selectors.sheetUrl"
                  issueState={sheetUrlIssue}
                />
                <Button variant="outlined" onClick={applySheetIdFromUrl}>
                  Извлечь ID листа
                </Button>
              </Stack>
            ) : null}

            {config.selectors.sheetSelectMode === "byId" ? (
              <FieldValueInput
                label="ID листа (gid)"
                value={config.selectors.sheetId}
                onChange={(value) => updateSelectors({ sheetId: value })}
                dataFieldPath="config.googleSheets.selectors.sheetId"
                issueState={sheetIdIssue}
              />
            ) : null}

            {config.selectors.sheetSelectMode === "byName" ? (
              <FieldValueInput
                label="Имя листа"
                value={config.selectors.sheetName}
                onChange={(value) => updateSelectors({ sheetName: value })}
                dataFieldPath="config.googleSheets.selectors.sheetName"
                issueState={sheetNameIssue}
              />
            ) : null}

            {config.selectors.sheetSelectMode === "fromList" ? (
              <FieldValueInput
                label="Лист (из списка)"
                value={config.selectors.sheetId}
                onChange={(value) => updateSelectors({ sheetId: value })}
                placeholder="Пока без данных"
                dataFieldPath="config.googleSheets.selectors.sheetId"
                issueState={sheetIdIssue}
              />
            ) : null}
          </Stack>
        </>
      ) : null}

      <Typography variant="subtitle2">Параметры операции</Typography>
      <Box>{config.resource === "document" ? renderDocumentParams() : renderSheetParams()}</Box>
    </Stack>
  );
}
