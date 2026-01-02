import {
  Autocomplete,
  Box,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";

import { TOOL_OPTIONS, type ToolOption } from "../../model/toolOptions";

export function ToolPickerForm(props: {
  onSelect: (option: ToolOption) => void;
}) {
  const { onSelect } = props;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Autocomplete
        options={TOOL_OPTIONS}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        autoHighlight
        fullWidth
        onChange={(_, value) => {
          if (!value) return;
          const resolved = TOOL_OPTIONS.find((option) => option.id === value.id);
          if (resolved) onSelect(resolved);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Поиск инструментов"
            size="medium"
            placeholder="Начните вводить..."
          />
        )}
        renderOption={(propsOption, option) => (
          <Box component="li" {...propsOption}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <option.Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={option.title}
              secondary={option.description}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </Box>
        )}
      />
    </Box>
  );
}
