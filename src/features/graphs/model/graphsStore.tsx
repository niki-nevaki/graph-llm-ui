import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { GraphSummary, GraphDefinition } from "./types";
import type { Node, Edge, Viewport } from "@xyflow/react";
import {
  createDefaultNodeConfig,
  type DefinitionNode,
  type NodeKind,
} from "../../../domain/workflow";

type GraphsStoreValue = {
  graphs: GraphSummary[];
  getGraphById: (id: string) => GraphSummary | undefined;
  createGraph: (name?: string) => GraphSummary;
  deleteGraph: (id: string) => void;
  updateGraphDefinition: (id: string, definition: GraphDefinition) => void;
};

const GraphsStoreContext = createContext<GraphsStoreValue | null>(null);

const createDefinitionNode = (id: string, kind: NodeKind): DefinitionNode => {
  const base = {
    id,
    name: kind === "text" ? "Текст" : kind === "llm" ? "Языковая модель" : "Агент",
    enabled: true,
    meta: { description: "" },
  };

  switch (kind) {
    case "text":
      return { ...base, kind, config: createDefaultNodeConfig("text") };
    case "llm":
      return { ...base, kind, config: createDefaultNodeConfig("llm") };
    case "agent":
      return { ...base, kind, config: createDefaultNodeConfig("agent") };
    default:
      return { ...base, kind, config: createDefaultNodeConfig("text") };
  }
};

const createDefinition = (
  nodes: Array<Node<DefinitionNode>>,
  edges: Edge[],
  viewport?: Viewport
): GraphDefinition => ({ nodes, edges, viewport });

const createInitialGraphs = (): GraphSummary[] => {
  const now = Date.now();

  const graphA: GraphSummary = {
    id: "graph-1",
    name: "Онбординг",
    createdAt: now - 1000 * 60 * 60 * 24 * 3,
    updatedAt: now - 1000 * 60 * 18,
    definition: createDefinition(
      [
        {
          id: "1",
          type: "appNode",
          position: { x: 160, y: 120 },
          data: createDefinitionNode("1", "text"),
        },
        {
          id: "2",
          type: "appNode",
          position: { x: 520, y: 120 },
          data: createDefinitionNode("2", "llm"),
        },
      ],
      [
        {
          id: "edge-1-2",
          source: "1",
          target: "2",
          sourceHandle: "out",
          targetHandle: "in",
          type: "custom",
        },
      ],
      { x: 0, y: 0, zoom: 1 }
    ),
  };

  const graphB: GraphSummary = {
    id: "graph-2",
    name: "Агент поддержки",
    createdAt: now - 1000 * 60 * 60 * 24 * 1,
    updatedAt: now - 1000 * 60 * 42,
    definition: createDefinition(
      [
        {
          id: "1",
          type: "appNode",
          position: { x: 240, y: 160 },
          data: createDefinitionNode("1", "agent"),
        },
      ],
      [],
      { x: 0, y: 0, zoom: 1 }
    ),
  };

  const graphC: GraphSummary = {
    id: "graph-3",
    name: "Продуктовый прототип",
    createdAt: now - 1000 * 60 * 60 * 10,
    updatedAt: now - 1000 * 60 * 7,
    definition: createDefinition(
      [
        {
          id: "1",
          type: "appNode",
          position: { x: 180, y: 120 },
          data: createDefinitionNode("1", "text"),
        },
        {
          id: "2",
          type: "appNode",
          position: { x: 520, y: 240 },
          data: createDefinitionNode("2", "agent"),
        },
      ],
      [],
      { x: 0, y: 0, zoom: 1 }
    ),
  };

  return [graphA, graphB, graphC];
};

export function GraphsProvider({ children }: { children: React.ReactNode }) {
  const [graphs, setGraphs] = useState<GraphSummary[]>(createInitialGraphs);

  const getGraphById = useCallback(
    (id: string) => graphs.find((graph) => graph.id === id),
    [graphs]
  );

  const createGraph = useCallback((name?: string) => {
    const now = Date.now();
    const id = `graph-${now}`;
    const graph: GraphSummary = {
      id,
      name: name?.trim() || "Новый граф",
      createdAt: now,
      updatedAt: now,
      definition: createDefinition([], [], { x: 0, y: 0, zoom: 1 }),
    };
    setGraphs((prev) => [graph, ...prev]);
    return graph;
  }, []);

  const deleteGraph = useCallback((id: string) => {
    setGraphs((prev) => prev.filter((graph) => graph.id !== id));
  }, []);

  const updateGraphDefinition = useCallback(
    (id: string, definition: GraphDefinition) => {
      setGraphs((prev) =>
        prev.map((graph) =>
          graph.id === id
            ? {
                ...graph,
                definition,
                updatedAt: Date.now(),
              }
            : graph
        )
      );
    },
    []
  );

  const value = useMemo(
    () => ({ graphs, getGraphById, createGraph, deleteGraph, updateGraphDefinition }),
    [graphs, getGraphById, createGraph, deleteGraph, updateGraphDefinition]
  );

  return (
    <GraphsStoreContext.Provider value={value}>
      {children}
    </GraphsStoreContext.Provider>
  );
}

export function useGraphsStore() {
  const ctx = useContext(GraphsStoreContext);
  if (!ctx) {
    throw new Error("useGraphsStore must be used within GraphsProvider");
  }
  return ctx;
}
