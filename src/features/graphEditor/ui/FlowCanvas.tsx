import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeTypes,
  type FinalConnectionState,
  type HandleType,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type NodeTypes,
  type Viewport,
} from "@xyflow/react";
import type { IsValidConnection } from "@xyflow/system";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo } from "react";

import {
  isNodeKind,
  type DefinitionNode,
  type NodeKind,
} from "../../../domain/workflow";
import { AppNode } from "./nodes/AppNode";

const nodeTypesDefault = { appNode: AppNode };

type Props = {
  nodes: Array<Node<DefinitionNode>>;
  edges: Edge[];
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  edgesReconnectable?: boolean;
  reconnectRadius?: number;
  onReconnect?: (edge: Edge<DefinitionNode>, connection: Connection) => void;
  onReconnectStart?: (
    event: React.MouseEvent,
    edge: Edge<DefinitionNode>,
    handleType: HandleType
  ) => void;
  onReconnectEnd?: (
    event: MouseEvent | TouchEvent,
    edge: Edge<DefinitionNode>,
    handleType: HandleType,
    connectionState: FinalConnectionState
  ) => void;
  isValidConnection?: IsValidConnection;
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
  nodeTypes,
  edgeTypes,
  edgesReconnectable = true,
  reconnectRadius = 14,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
  isValidConnection,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onCreateNode,
  onNodeClick,
  onPaneClick,
  defaultViewport,
}: Props) {
  const { screenToFlowPosition } = useReactFlow();
  const theme = useTheme();

  const edgeVars = useMemo(
    () => ({
      "--edge-color": alpha(
        theme.palette.text.primary,
        theme.palette.mode === "dark" ? 0.35 : 0.28
      ),
      "--edge-color-hover": alpha(theme.palette.primary.main, 0.6),
      "--edge-color-selected": theme.palette.primary.main,
      "--edge-color-active": theme.palette.primary.main,
      "--edge-glow": alpha(theme.palette.primary.main, 0.35),
    }),
    [theme]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "custom",
      interactionWidth: 28,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        strokeWidth: 2,
        color: alpha(
          theme.palette.text.primary,
          theme.palette.mode === "dark" ? 0.5 : 0.45
        ),
      },
    }),
    [theme]
  );

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
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
        position: "relative",
        ...edgeVars,
      }}
    >
      <ReactFlow
        nodeTypes={nodeTypes ?? nodeTypesDefault}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        edgesReconnectable={edgesReconnectable}
        reconnectRadius={reconnectRadius}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        isValidConnection={isValidConnection}
        fitView
        defaultViewport={defaultViewport}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {nodes.length === 0 ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            color: "text.secondary",
          }}
        >
          Перетащите ноду на холст
        </Box>
      ) : null}
    </Box>
  );
}
