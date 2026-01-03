import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTransition } from "../../../../shared/ui/PageTransition";
import { CredentialTypePickerDialog } from "../../components/CredentialTypePickerDialog/CredentialTypePickerDialog";
import { CredentialEditorForm } from "../../components/CredentialEditorForm/CredentialEditorForm";
import { createCredential } from "../../api/credentialsApi";
import { useCredentialTypes } from "../../hooks/useCredentialTypes";
import type { CredentialPayload, CredentialTypeDefinition } from "../../model/types";
import type { CredentialFormValues } from "../../components/CredentialEditorForm/CredentialEditorForm";

const EMPTY_INITIAL: CredentialFormValues | undefined = undefined;

type LocationState = {
  type?: string;
  initialValues?: CredentialFormValues;
};

export function CredentialCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: types, loading } = useCredentialTypes();
  const [selectedType, setSelectedType] = useState<CredentialTypeDefinition | null>(
    null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const state = location.state as LocationState | null;
  const initialValues = state?.initialValues ?? EMPTY_INITIAL;

  useEffect(() => {
    if (selectedType || !state?.type || types.length === 0) {
      return;
    }
    const match = types.find((item) => item.type === state.type);
    if (match) {
      setSelectedType(match);
    }
  }, [selectedType, state?.type, types]);

  useEffect(() => {
    if (!selectedType && !state?.type) {
      setShowPicker(true);
    }
  }, [selectedType, state?.type]);

  const handleTypeSelect = (type: CredentialTypeDefinition) => {
    setSelectedType(type);
    setShowPicker(false);
  };

  const handleSubmit = async (payload: CredentialPayload) => {
    setSaving(true);
    try {
      const response = await createCredential(payload);
      navigate(`/credentials/${response.id}`);
    } finally {
      setSaving(false);
    }
  };

  const content = useMemo(() => {
    if (!selectedType) {
      return (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="h5">Создать учетные данные</Typography>
          <Typography variant="body2" color="text.secondary">
            Выберите тип учетных данных, которые хотите создать.
          </Typography>
          <Button variant="contained" onClick={() => setShowPicker(true)}>
            Выбрать тип
          </Button>
        </Stack>
      );
    }

    return (
      <CredentialEditorForm
        mode="create"
        typeDefinition={selectedType}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/credentials")}
        saving={saving}
      />
    );
  }, [initialValues, navigate, saving, selectedType]);

  return (
    <PageTransition>
      <Box sx={{ flex: 1, p: 3 }}>
        {content}
        <CredentialTypePickerDialog
          open={showPicker}
          types={types}
          loading={loading}
          onClose={() => setShowPicker(false)}
          onSelect={handleTypeSelect}
        />
      </Box>
    </PageTransition>
  );
}
