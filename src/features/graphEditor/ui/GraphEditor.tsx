import { Box } from "@mui/material";
import {
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";

import {
  createDefaultNodeConfig,
  type DefinitionNode,
  type NodeKind,
} from "../../../domain/workflow";
import { DEFAULT_EDITOR_STATE } from "../model/editorState";
import { FlowCanvas } from "./FlowCanvas";
import { NodeInspector } from "./NodeInspector";
import { NodePalette } from "./NodePalette";
import { NODE_SPECS } from "./nodes/nodeSpecs";

const initialEdges: Edge[] = [];

let idCounter = 3;
const nextId = () => String(idCounter++);

const createDefinitionNode = (id: string, kind: NodeKind): DefinitionNode => {
  const base = {
    id,
    name: NODE_SPECS[kind].title,
    enabled: true,
    meta: { description: "" },
  };

  switch (kind) {
    case "text":
      return { ...base, kind, config: createDefaultNodeConfig("text") };
    case "tgBot":
      return { ...base, kind, config: createDefaultNodeConfig("tgBot") };
    case "relDb":
      return { ...base, kind, config: createDefaultNodeConfig("relDb") };
    case "llm":
      return { ...base, kind, config: createDefaultNodeConfig("llm") };
    case "agent":
      return { ...base, kind, config: createDefaultNodeConfig("agent") };
    default:
      throw new Error(`Unsupported node kind: ${kind}`);
  }
};

const initialNodes: Array<Node<DefinitionNode>> = [
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
];

export function GraphEditor() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<DefinitionNode>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState(
    DEFAULT_EDITOR_STATE.selectedNodeId
  );
  const [inspectorWidth, setInspectorWidth] = useState(
    DEFAULT_EDITOR_STATE.inspectorWidth
  );
  const [inspectorOpen, setInspectorOpen] = useState(
    DEFAULT_EDITOR_STATE.inspectorOpen
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
          },
          eds
        )
      ),
    [setEdges]
  );

  const onCreateNode = useCallback(
    (kind: NodeKind, position: { x: number; y: number }) => {
      const id = nextId();
      const newNode: Node<DefinitionNode> = {
        id,
        type: "appNode",
        position,
        data: createDefinitionNode(id, kind),
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(id);
      setInspectorOpen(true);
    },
    [setNodes]
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((x) => x.id === selectedNodeId);
    return n ? { id: n.id, data: n.data } : null;
  }, [nodes, selectedNodeId]);

  const allNodesForInspector = useMemo(
    () => nodes.map((n) => ({ id: n.id, data: n.data })),
    [nodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, nextData: DefinitionNode) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...nextData, id: nodeId } }
            : n
        )
      );
    },
    [setNodes]
  );

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <NodePalette />
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onCreateNode={onCreateNode}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
            setInspectorOpen(true);
          }}
          onPaneClick={() => setSelectedNodeId(null)}
        />
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
    </ReactFlowProvider>
  );
}
