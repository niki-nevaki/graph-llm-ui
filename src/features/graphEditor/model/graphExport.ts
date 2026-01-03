import type { Edge, Node } from "@xyflow/react";
import type { DefinitionNode } from "../../../domain/workflow";
import type {
  GraphEditorStateExport,
  GraphExportEdge,
  GraphExportNode,
  GraphExportPayload,
} from "../../../types/graphExport";

type BuildGraphExportInput = {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  selectedNodeId: string | null;
  inspectorOpen: boolean;
  inspectorWidth: number;
  issuesOpen: boolean;
  showFieldIssues: boolean;
};

const sortById = <T extends { id: string }>(items: T[]) =>
  [...items].sort((a, b) => a.id.localeCompare(b.id));

const toExportNode = (node: Node<DefinitionNode>): GraphExportNode => ({
  id: node.id,
  type: node.type,
  position: node.position,
  data: node.data,
  style: node.style,
  ui: { selected: node.selected },
  dimensions: { width: node.width ?? null, height: node.height ?? null },
});

const toExportEdge = (edge: Edge): GraphExportEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  type: edge.type,
  label: edge.label,
  animated: edge.animated,
  style: edge.style,
  markerStart: edge.markerStart,
  markerEnd: edge.markerEnd,
  data: edge.data,
});

export function buildGraphExportPayload(
  input: BuildGraphExportInput
): GraphExportPayload {
  const { nodes, edges, viewport } = input;

  const selectedNodeIds = nodes
    .filter((node) => node.selected)
    .map((node) => node.id);
  const selectedEdgeIds = edges
    .filter((edge) => edge.selected)
    .map((edge) => edge.id);

  const editorState: GraphEditorStateExport = {
    viewport,
    selection: {
      selectedNodeIds,
      selectedEdgeIds,
      activeNodeId: input.selectedNodeId,
    },
    sidebar: {
      isOpen: input.inspectorOpen,
      activeTabId: "general",
      width: input.inspectorWidth,
    },
    panels: {
      issuesPanel: {
        isOpen: input.issuesOpen,
        activeTab: null,
      },
    },
    settings: {
      showFieldIssues: input.showFieldIssues,
    },
  };

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    graph: {
      nodes: sortById(nodes).map(toExportNode),
      edges: sortById(edges).map(toExportEdge),
    },
    editorState,
  };
}
