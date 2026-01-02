import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, IconButton, Stack, TextField } from "@mui/material";
import type { ToolDefinitionNode } from "../../../../domain/workflow";

export function ToolNodeSettingsForm(props: {
  data: ToolDefinitionNode;
  onChange: (patch: Partial<ToolDefinitionNode["config"]>) => void;
}) {
  const { data, onChange } = props;
  const fields = data.config.fields ?? [];

  const updateField = (index: number, patch: { key?: string; value?: string }) => {
    onChange({
      fields: fields.map((field, i) =>
        i === index ? { ...field, ...patch } : field
      ),
    });
  };

  const addField = () => {
    onChange({ fields: fields.concat({ key: "", value: "" }) });
  };

  const removeField = (index: number) => {
    onChange({ fields: fields.filter((_, i) => i !== index) });
  };

  return (
    <Stack spacing={1.25}>
      {fields.map((field, index) => (
        <Box
          key={`${field.key}-${index}`}
          sx={{ display: "flex", gap: 1, alignItems: "center" }}
        >
          <TextField
            label="Ключ"
            size="medium"
            value={field.key}
            onChange={(e) => updateField(index, { key: e.target.value })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Значение"
            size="medium"
            value={field.value}
            onChange={(e) => updateField(index, { value: e.target.value })}
            sx={{ flex: 1 }}
          />
          <IconButton
            aria-label="Удалить поле"
            onClick={() => removeField(index)}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Button variant="outlined" size="medium" onClick={addField}>
        Добавить поле
      </Button>
    </Stack>
  );
}
