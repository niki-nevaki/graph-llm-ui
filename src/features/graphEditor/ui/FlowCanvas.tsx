import { Box } from "@mui/material";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";

import {
  isNodeKind,
  type DefinitionNode,
  type NodeKind,
} from "../../../domain/workflow";
import { AppNode } from "./nodes/AppNode";

const nodeTypes = { appNode: AppNode };

type Props = {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<DefinitionNode>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection) => void;
  onCreateNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  onNodeClick: (event: React.MouseEvent, node: Node<DefinitionNode>) => void;
  onPaneClick: () => void;
  defaultViewport?: Viewport;
};

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onCreateNode,
  onNodeClick,
  onPaneClick,
  defaultViewport,
}: Props) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const kindRaw = event.dataTransfer.getData(
        "application/reactflow-node-kind"
      );
      if (!isNodeKind(kindRaw)) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onCreateNode(kindRaw, position);
    },
    [onCreateNode, screenToFlowPosition]
  );

  return (
    <Box sx={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        defaultViewport={defaultViewport}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
}
