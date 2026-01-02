export type GraphEditorUiState = {
  selectedNodeId: string | null;
  inspectorWidth: number;
  inspectorOpen: boolean;
};

export const DEFAULT_EDITOR_STATE: GraphEditorUiState = {
  selectedNodeId: null,
  inspectorWidth: 900,
  inspectorOpen: true,
};
