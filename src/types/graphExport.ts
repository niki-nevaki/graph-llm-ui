import type { Edge, Node } from "@xyflow/react";
import type { DefinitionNode } from "../domain/workflow";

export type GraphExportNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: DefinitionNode;
  style?: Node["style"];
  ui?: {
    selected?: boolean;
  };
  dimensions?: {
    width?: number | null;
    height?: number | null;
  };
};

export type GraphExportEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  label?: Edge["label"];
  animated?: boolean;
  style?: Edge["style"];
  markerStart?: Edge["markerStart"];
  markerEnd?: Edge["markerEnd"];
  data?: Edge["data"];
};

export type GraphEditorStateExport = {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selection: {
    selectedNodeIds: string[];
    selectedEdgeIds: string[];
    activeNodeId?: string | null;
  };
  sidebar: {
    isOpen: boolean;
    activeTabId?: "general" | "json" | "output" | null;
    width?: number;
  };
  panels: {
    issuesPanel: {
      isOpen: boolean;
      activeTab?: "problems" | "execution" | null;
    };
  };
  settings?: {
    showFieldIssues?: boolean;
    animationsEnabled?: boolean;
    gridEnabled?: boolean;
    snapToGrid?: boolean;
  };
};

export type GraphExportPayload = {
  schemaVersion: number;
  exportedAt: string;
  appVersion?: string;
  graphId?: string;
  name?: string;
  description?: string;
  graph: {
    nodes: GraphExportNode[];
    edges: GraphExportEdge[];
  };
  editorState?: GraphEditorStateExport;
};
