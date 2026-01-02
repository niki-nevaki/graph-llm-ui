import { Box } from "@mui/material";
import {
  ReactFlowProvider,
  addEdge,
  MarkerType,
  useEdgesState,
  useNodesState,
  type NodeTypes,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";

import {
  createDefaultNodeConfig,
  type DefinitionNode,
  type NodeKind,
  type ToolDefinitionNode,
} from "../../../domain/workflow";
import { DEFAULT_EDITOR_STATE } from "../model/editorState";
import { FlowCanvas } from "./FlowCanvas";
import { NodeInspector } from "./NodeInspector";
import { NodePalette } from "./NodePalette";
import { AppNode } from "./nodes/AppNode";
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
    case "tool":
      return { ...base, kind, config: createDefaultNodeConfig("tool") };
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

type ToolDraft = {
  agentId: string;
  data: ToolDefinitionNode;
  position: { x: number; y: number };
};

export function GraphEditor() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<DefinitionNode>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const [selectedNodeId, setSelectedNodeId] = useState(
    DEFAULT_EDITOR_STATE.selectedNodeId
  );
  const [toolDraft, setToolDraft] = useState<ToolDraft | null>(null);
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

  const requestToolDraft = useCallback((agentId: string) => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const agentNode = currentNodes.find((node) => node.id === agentId);
    if (!agentNode) return;

    const toolIndex = currentEdges.filter(
      (edge) => edge.target === agentId && edge.targetHandle === "tool"
    ).length;

    const draftId = `draft-tool-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const draft: ToolDraft = {
      agentId,
      position: {
        x: agentNode.position.x,
        y: agentNode.position.y + 220 + toolIndex * 140,
      },
      data: {
        id: draftId,
        kind: "tool",
        name: NODE_SPECS.tool.title,
        enabled: true,
        meta: { description: "" },
        config: createDefaultNodeConfig("tool"),
      },
    };

    setToolDraft(draft);
    setSelectedNodeId(null);
    setInspectorOpen(true);
  }, []);

  const updateToolDraft = useCallback((nextData: DefinitionNode) => {
    setToolDraft((draft) =>
      draft
        ? {
            ...draft,
            data: { ...nextData, id: draft.data.id } as ToolDefinitionNode,
          }
        : draft
    );
  }, []);

  const confirmToolDraft = useCallback(() => {
    setToolDraft((draft) => {
      if (!draft) return draft;

      const nodeId = nextId();
      const edgeId = `edge-${nodeId}-${draft.agentId}`;

      const toolNode: Node<DefinitionNode> = {
        id: nodeId,
        type: "appNode",
        position: draft.position,
        data: { ...draft.data, id: nodeId },
      };

      setNodes((nds) => nds.concat(toolNode));
      setEdges((eds) =>
        addEdge(
          {
            id: edgeId,
            source: nodeId,
            sourceHandle: "out",
            target: draft.agentId,
            targetHandle: "tool",
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );

      setSelectedNodeId(nodeId);
      setInspectorOpen(true);

      return null;
    });
  }, [setEdges, setNodes]);

  const cancelToolDraft = useCallback(() => {
    setToolDraft(null);
    setInspectorOpen(false);
  }, []);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((x) => x.id === selectedNodeId);
    return n ? { id: n.id, data: n.data } : null;
  }, [nodes, selectedNodeId]);

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

  const inspectorNode = toolDraft
    ? { id: toolDraft.data.id, data: toolDraft.data }
    : selectedNode;

  const inspectorUpdate = toolDraft ? updateToolDraft : updateNodeData;

  const inspectorDraftActions = toolDraft
    ? {
        confirmLabel: "Добавить инструмент",
        onConfirm: confirmToolDraft,
        onCancel: cancelToolDraft,
      }
    : undefined;

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      appNode: (props) => (
        <AppNode {...props} onRequestToolDraft={requestToolDraft} />
      ),
    }),
    [requestToolDraft]
  );

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <NodePalette />
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onCreateNode={onCreateNode}
          onNodeClick={(_, node) => {
            if (toolDraft) return;
            setSelectedNodeId(node.id);
            setInspectorOpen(true);
          }}
          onPaneClick={() => {
            if (toolDraft) return;
            setSelectedNodeId(null);
          }}
        />
        <NodeInspector
          open={inspectorOpen}
          width={inspectorWidth}
          selectedNode={inspectorNode}
          draftActions={inspectorDraftActions}
          onClose={() => {
            if (toolDraft) {
              cancelToolDraft();
              return;
            }
            setInspectorOpen(false);
          }}
          onUpdate={inspectorUpdate}
          onWidthChange={setInspectorWidth}
        />
      </Box>
    </ReactFlowProvider>
  );
}
