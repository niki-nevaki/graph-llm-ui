import type { Edge, Node, Viewport } from "@xyflow/react";
import type { DefinitionNode } from "../../../domain/workflow";

export type GraphDefinition = {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  viewport?: Viewport;
};

export type GraphSummary = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  definition: GraphDefinition;
};
