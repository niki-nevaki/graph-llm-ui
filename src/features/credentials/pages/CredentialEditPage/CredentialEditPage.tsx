import { Alert, Box, Button, Skeleton, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTransition } from "../../../../shared/ui/PageTransition";
import { CredentialEditorForm } from "../../components/CredentialEditorForm/CredentialEditorForm";
import { DeleteCredentialDialog } from "../../components/DeleteCredentialDialog/DeleteCredentialDialog";
import { deleteCredential, updateCredential } from "../../api/credentialsApi";
import { useCredential } from "../../hooks/useCredential";
import { useCredentialTypes } from "../../hooks/useCredentialTypes";
import type { CredentialFormValues } from "../../components/CredentialEditorForm/CredentialEditorForm";
import type { CredentialPayload } from "../../model/types";

export function CredentialEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, loading, error, reload } = useCredential(id);
  const { items: types } = useCredentialTypes();
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const typeDefinition = useMemo(() => {
    if (!data) {
      return null;
    }
    return types.find((item) => item.type === data.type) ?? null;
  }, [data, types]);

  const initialValues: CredentialFormValues | undefined = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return {
      name: data.name,
      data: data.data,
      dataMeta: data.dataMeta,
    };
  }, [data]);

  const handleSubmit = async (payload: CredentialPayload) => {
    if (!id) {
      return;
    }
    setSaving(true);
    try {
      await updateCredential(id, payload);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !data) {
      return;
    }
    setSaving(true);
    try {
      await deleteCredential(id);
      navigate("/credentials");
    } finally {
      setSaving(false);
      setShowDelete(false);
    }
  };

  return (
    <PageTransition>
      <Box sx={{ flex: 1, p: 3 }}>
        {loading && (
          <Stack spacing={2} sx={{ maxWidth: 720 }}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        )}
        {error && (
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
        )}
        {!loading && data && typeDefinition && (
          <CredentialEditorForm
            mode="edit"
            typeDefinition={typeDefinition}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/credentials")}
            onDelete={() => setShowDelete(true)}
            saving={saving}
          />
        )}
        {!loading && data && !typeDefinition && (
          <Alert severity="error">Неизвестный тип учетных данных.</Alert>
        )}
      </Box>

      {data && (
        <DeleteCredentialDialog
          open={showDelete}
          name={data.name}
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </PageTransition>
  );
}
