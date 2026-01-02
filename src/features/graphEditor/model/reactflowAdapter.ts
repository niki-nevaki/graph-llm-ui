import type { Edge, Node, Viewport } from "@xyflow/react";

import type {
  DefinitionEdge,
  DefinitionNode,
  EditorLayout,
  WorkflowDefinition,
} from "../../../domain/workflow";

const DEFAULT_DEFINITION_META = {
  id: "draft",
  name: "Untitled workflow",
  version: "1",
};

export function toDto(
  nodes: Array<Node<DefinitionNode>>,
  edges: Edge[],
  viewport?: Viewport
): { definition: WorkflowDefinition; layout: EditorLayout } {
  const definitionNodes: DefinitionNode[] = nodes.map((node) => ({
    id: node.id,
    kind: node.data.kind,
    name: node.data.name,
    enabled: node.data.enabled,
    meta: node.data.meta,
    config: node.data.config,
  }));

  const definitionEdges: DefinitionEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: {
      nodeId: edge.source,
      portId: edge.sourceHandle ?? undefined,
    },
    target: {
      nodeId: edge.target,
      portId: edge.targetHandle ?? undefined,
    },
  }));

  const layout: EditorLayout = {
    nodeLayouts: Object.fromEntries(
      nodes.map((node) => [
        node.id,
        {
          x: node.position.x,
          y: node.position.y,
        },
      ])
    ),
    viewport: viewport ? { x: viewport.x, y: viewport.y, zoom: viewport.zoom } : undefined,
  };

  return {
    definition: {
      ...DEFAULT_DEFINITION_META,
      nodes: definitionNodes,
      edges: definitionEdges,
    },
    layout,
  };
}

export function fromDto(payload: {
  definition: WorkflowDefinition;
  layout?: EditorLayout;
}): {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  viewport?: Viewport;
} {
  const { definition, layout } = payload;

  const nodes = definition.nodes.map((node) => {
    const position = layout?.nodeLayouts[node.id] ?? { x: 0, y: 0 };
    return {
      id: node.id,
      type: "appNode",
      position: { x: position.x, y: position.y },
      data: node,
    } satisfies Node<DefinitionNode>;
  });

  const edges = definition.edges.map((edge) => ({
    id: edge.id,
    source: edge.source.nodeId,
    target: edge.target.nodeId,
    sourceHandle: edge.source.portId,
    targetHandle: edge.target.portId,
    type: "smoothstep",
  }));

  return {
    nodes,
    edges,
    viewport: layout?.viewport,
  };
}
