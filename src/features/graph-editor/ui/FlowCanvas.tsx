import { Box } from "@mui/material";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";

import {
  createNodeData,
  isNodeKind,
  type AppNodeData,
  type NodeKind,
} from "../../../types/types";
import { NodeInspector } from "./NodeInspector";
import { AppNode } from "./nodes/AppNode";

const nodeTypes = { appNode: AppNode };

const initialNodes: Node<AppNodeData>[] = [
  {
    id: "1",
    type: "appNode",
    position: { x: 160, y: 120 },
    data: createNodeData("text"),
  },
  {
    id: "2",
    type: "appNode",
    position: { x: 520, y: 120 },
    data: createNodeData("llm"),
  },
];

const initialEdges: Edge[] = [];

let idCounter = 3;
const nextId = () => String(idCounter++);

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<AppNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // дефолт шире (в 2 раза относительно прежнего)
  const [inspectorWidth, setInspectorWidth] = useState(900);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
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

      const kind = kindRaw as NodeKind;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<AppNodeData> = {
        id: nextId(),
        type: "appNode",
        position,
        data: createNodeData(kind),
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(newNode.id);
      setInspectorOpen(true);
    },
    [screenToFlowPosition, setNodes]
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((x) => x.id === selectedNodeId);
    return n ? { id: n.id, data: n.data as AppNodeData } : null;
  }, [nodes, selectedNodeId]);

  const allNodesForInspector = useMemo(
    () => nodes.map((n) => ({ id: n.id, data: n.data as AppNodeData })),
    [nodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, nextData: AppNodeData) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: nextData } : n))
      );
    },
    [setNodes]
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Canvas */}
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
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
            setInspectorOpen(true);
          }}
          onPaneClick={() => setSelectedNodeId(null)}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>

      {/* Inspector */}
      <NodeInspector
        open={inspectorOpen}
        width={inspectorWidth}
        selectedNode={selectedNode}
        allNodes={allNodesForInspector}
        onClose={() => setInspectorOpen(false)}
        onUpdate={updateNodeData}
        onWidthChange={setInspectorWidth}
      />
    </Box>
  );
}
