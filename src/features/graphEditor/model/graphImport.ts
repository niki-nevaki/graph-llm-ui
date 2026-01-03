import type { Edge, Node } from "@xyflow/react";
import type { DefinitionNode } from "../../../domain/workflow";
import type {
  GraphEditorStateExport,
  GraphExportPayload,
} from "../../../types/graphExport";

type GraphImportResult = {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  editorState?: GraphEditorStateExport;
};

const normalizeSelection = (payload: GraphExportPayload) =>
  payload.editorState?.selection ?? {
    selectedNodeIds: [],
    selectedEdgeIds: [],
    activeNodeId: null,
  };

export function applyGraphExport(payload: GraphExportPayload): GraphImportResult {
  const selection = normalizeSelection(payload);

  const nodes = payload.graph.nodes.map((node) => ({
    id: node.id,
    type: node.type ?? "appNode",
    position: node.position,
    data: node.data,
    style: node.style,
    width: node.dimensions?.width ?? undefined,
    height: node.dimensions?.height ?? undefined,
    selected: selection.selectedNodeIds.includes(node.id),
  }));

  const edges = payload.graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    type: edge.type ?? "custom",
    label: edge.label,
    animated: edge.animated,
    style: edge.style,
    markerStart: edge.markerStart,
    markerEnd: edge.markerEnd,
    data: edge.data,
    selected: selection.selectedEdgeIds.includes(edge.id),
  }));

  return { nodes, edges, editorState: payload.editorState };
}
