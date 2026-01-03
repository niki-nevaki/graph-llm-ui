import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { SelectChangeEvent } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "../../../../shared/ui/PageTransition";
import { useCredentialsList } from "../../hooks/useCredentialsList";
import { useCredentialTypes } from "../../hooks/useCredentialTypes";
import { CredentialsTable } from "../../components/CredentialsTable/CredentialsTable";
import { CredentialTypePickerDialog } from "../../components/CredentialTypePickerDialog/CredentialTypePickerDialog";
import { DeleteCredentialDialog } from "../../components/DeleteCredentialDialog/DeleteCredentialDialog";
import type { CredentialSummary, CredentialTypeDefinition } from "../../model/types";
import { deleteCredential, getCredential } from "../../api/credentialsApi";

export function CredentialsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CredentialSummary | null>(null);
  const [showTypeDialog, setShowTypeDialog] = useState(false);

  const { items: types, loading: typesLoading } = useCredentialTypes();
  const typeLabelMap = useMemo(
    () => new Map(types.map((type) => [type.type, type.displayName])),
    [types]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  const listParams = useMemo(
    () => ({
      search: debouncedSearch,
      types: typeFilter,
    }),
    [debouncedSearch, typeFilter]
  );

  const { items, loading, error, reload } = useCredentialsList(listParams);

  const handleCreate = () => {
    setShowTypeDialog(true);
  };

  const handleTypeSelect = (type: CredentialTypeDefinition) => {
    setShowTypeDialog(false);
    navigate("/credentials/new", { state: { type: type.type } });
  };

  const handleEdit = (id: string) => {
    navigate(`/credentials/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteCredential(deleteTarget.id);
    setDeleteTarget(null);
    await reload();
  };

  const handleDuplicate = async (item: CredentialSummary) => {
    const details = await getCredential(item.id);
    const data = { ...details.data };
    const dataMeta = { ...details.dataMeta };

    if (dataMeta) {
      Object.entries(dataMeta).forEach(([key]) => {
        data[key] = undefined;
        dataMeta[key] = { isSet: false };
      });
    }

    navigate("/credentials/new", {
      state: {
        type: details.type,
        initialValues: {
          name: `Копия ${details.name}`,
          data,
          dataMeta,
        },
      },
    });
  };

  return (
    <PageTransition>
      <Box sx={{ flex: 1, p: 3 }}>
        <Stack spacing={3} sx={{ maxWidth: 1120 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5">Учетные данные</Typography>
              <Typography variant="body2" color="text.secondary">
                Управляйте секретами и токенами подключений.
              </Typography>
            </Box>
            <Button variant="contained" onClick={handleCreate}>
              Создать учетные данные
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              placeholder="Поиск учетных данных"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="credential-type-filter">Тип</InputLabel>
              <Select
                labelId="credential-type-filter"
                multiple
                value={typeFilter}
                onChange={(event: SelectChangeEvent<string[]>) =>
                  setTypeFilter(event.target.value as string[])
                }
                input={<OutlinedInput label="Тип" />}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={typeLabelMap.get(value) ?? value}
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
              >
                {types.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    {type.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={52} />
              <Skeleton variant="rectangular" height={52} />
              <Skeleton variant="rectangular" height={52} />
            </Stack>
          ) : error ? (
            <Alert
              severity="error"
              action={
              <Button color="inherit" size="small" onClick={reload}>
                  Повторить
              </Button>
              }
            >
              {error.message}
            </Alert>
          ) : items.length === 0 ? (
            <Stack spacing={1} sx={{ py: 6, alignItems: "center" }}>
              <Typography variant="h6">Пока нет учетных данных</Typography>
              <Typography variant="body2" color="text.secondary">
                Создайте первые учетные данные для подключения сервисов.
              </Typography>
              <Button variant="contained" onClick={handleCreate}>
                Создать учетные данные
              </Button>
            </Stack>
          ) : (
            <CredentialsTable
              items={items}
              onEdit={handleEdit}
              onDelete={(item) => setDeleteTarget(item)}
              onDuplicate={handleDuplicate}
              getTypeLabel={(type) => typeLabelMap.get(type) ?? type}
            />
          )}
        </Stack>
      </Box>

      <CredentialTypePickerDialog
        open={showTypeDialog}
        types={types}
        loading={typesLoading}
        onClose={() => setShowTypeDialog(false)}
        onSelect={handleTypeSelect}
      />

      {deleteTarget && (
        <DeleteCredentialDialog
          open={Boolean(deleteTarget)}
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </PageTransition>
  );
}
