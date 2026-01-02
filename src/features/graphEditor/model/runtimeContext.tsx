import { createContext, useContext } from "react";
import type { Issue, NodeRunStatus } from "./runtime";

type GraphRuntimeContextValue = {
  nodeStatuses: Record<string, NodeRunStatus>;
  nodeIssues: Record<string, Issue[]>;
};

const GraphRuntimeContext = createContext<GraphRuntimeContextValue>({
  nodeStatuses: {},
  nodeIssues: {},
});

export function GraphRuntimeProvider({
  value,
  children,
}: {
  value: GraphRuntimeContextValue;
  children: React.ReactNode;
}) {
  return (
    <GraphRuntimeContext.Provider value={value}>
      {children}
    </GraphRuntimeContext.Provider>
  );
}

export function useGraphRuntime() {
  return useContext(GraphRuntimeContext);
}
