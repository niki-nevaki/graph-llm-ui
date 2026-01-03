import { Box } from "@mui/material";
import {
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type EdgeTypes,
  type NodeTypes,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createDefaultGoogleSheetsToolConfig,
  createDefaultHttpRequestToolConfig,
  createDefaultNodeConfig,
  type DefinitionNode,
  type NodeKind,
  type ToolDefinitionNode,
} from "../../../domain/workflow";
import { DEFAULT_EDITOR_STATE } from "../model/editorState";
import { validateGraphOnSubmit } from "../model/graphValidation";
import { applyGraphExport } from "../model/graphImport";
import type { NodeRunStatus, Issue, GraphRunState } from "../model/runtime";
import { runGraph } from "../model/runGraph";
import type { Execution, NodeRun } from "../model/executionState";
import { GraphRuntimeProvider } from "../model/runtimeContext";
import { FlowCanvas } from "./FlowCanvas";
import { GraphCanvasActions } from "./GraphCanvasActions";
import { IssuesPanel } from "./IssuesPanel";
import { NodeInspector } from "./NodeInspector";
import { NodePalette } from "./NodePalette";
import { CustomEdge } from "./edges/CustomEdge";
import { buildGraphExportPayload } from "../model/graphExport";
import { getGraph, saveGraph } from "../../../api/graphs/graphsApi";
import { AppNode } from "./nodes/AppNode";
import { NODE_SPECS } from "./nodes/nodeSpecs";
import type { ToolOption } from "../model/toolOptions";

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
  position: { x: number; y: number };
  targetHandle: "tool" | "memory";
};

export function GraphEditor() {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
}

function GraphEditorInner() {
  const reactFlow = useReactFlow();
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

  useEffect(() => {
    setNodeStatuses((prev) => {
      const next: Record<string, NodeRunStatus> = { ...prev };
      const ids = new Set(nodes.map((node) => node.id));
      nodes.forEach((node) => {
        if (!next[node.id]) {
          next[node.id] = "idle";
        }
      });
      Object.keys(next).forEach((id) => {
        if (!ids.has(id)) {
          delete next[id];
        }
      });
      return next;
    });
  }, [nodes]);

  const [selectedNodeId, setSelectedNodeId] = useState(
    DEFAULT_EDITOR_STATE.selectedNodeId
  );
  const [focusFieldPath, setFocusFieldPath] = useState<string | null>(null);
  const [toolDraft, setToolDraft] = useState<ToolDraft | null>(null);
  const [inspectorWidth, setInspectorWidth] = useState(
    DEFAULT_EDITOR_STATE.inspectorWidth
  );
  const [inspectorTabId, setInspectorTabId] = useState<
    "general" | "json" | "output"
  >("general");
  const [inspectorOpen, setInspectorOpen] = useState(
    DEFAULT_EDITOR_STATE.inspectorOpen
  );
  const [graphStatus, setGraphStatus] = useState<GraphRunState>("idle");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [showFieldIssues, setShowFieldIssues] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<"problems" | "execution">(
    "problems"
  );
  const [nodeStatuses, setNodeStatuses] = useState<
    Record<string, NodeRunStatus>
  >({});
  const [execution, setExecution] = useState<Execution | null>(null);
  const [nodeRuns, setNodeRuns] = useState<Record<string, NodeRun>>({});
  const [nodeRunOrder, setNodeRunOrder] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectEdgeIdRef = useRef<string | null>(null);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      const duplicate = edgesRef.current.some((edge) => {
        const same =
          edge.source === connection.source &&
          edge.target === connection.target &&
          (edge.sourceHandle ?? null) === (connection.sourceHandle ?? null) &&
          (edge.targetHandle ?? null) === (connection.targetHandle ?? null);
        if (!same) return false;
        if (reconnectEdgeIdRef.current) {
          return edge.id !== reconnectEdgeIdRef.current;
        }
        return true;
      });
      return !duplicate;
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
          },
          eds
        )
      ),
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((eds) =>
        reconnectEdge(oldEdge, newConnection, eds, {
          shouldReplaceId: false,
        })
      );
    },
    [setEdges]
  );

  const onReconnectStart = useCallback((_, edge: Edge) => {
    reconnectEdgeIdRef.current = edge.id;
  }, []);

  const onReconnectEnd = useCallback(() => {
    reconnectEdgeIdRef.current = null;
  }, []);

  const onExport = useCallback(async () => {
    const viewport = reactFlow.getViewport();
    const payload = buildGraphExportPayload({
      nodes: nodesRef.current,
      edges: edgesRef.current,
      viewport,
      selectedNodeId,
      inspectorOpen,
      inspectorWidth,
      inspectorTabId,
      issuesOpen,
      bottomPanelTab,
      showFieldIssues,
    });
    await saveGraph(payload);
  }, [
    inspectorOpen,
    inspectorWidth,
    inspectorTabId,
    issuesOpen,
    reactFlow,
    selectedNodeId,
    showFieldIssues,
  ]);

  const onLoad = useCallback(async () => {
    if (graphStatus === "running" || graphStatus === "validating") return;
    setGraphStatus("validating");
    const payload = await getGraph("mock");
    const result = applyGraphExport(payload);

    setNodes(result.nodes);
    setEdges(result.edges);

    const editorState = result.editorState;
    if (editorState?.selection) {
      setSelectedNodeId(editorState.selection.activeNodeId ?? null);
    } else {
      setSelectedNodeId(null);
    }

    if (editorState?.sidebar) {
      setInspectorOpen(Boolean(editorState.sidebar.isOpen));
      if (typeof editorState.sidebar.width === "number") {
        setInspectorWidth(editorState.sidebar.width);
      }
      if (editorState.sidebar.activeTabId === "json") {
        setInspectorTabId("json");
      } else if (editorState.sidebar.activeTabId === "output") {
        setInspectorTabId("output");
      } else {
        setInspectorTabId("general");
      }
    }

    if (editorState?.panels?.issuesPanel) {
      setIssuesOpen(Boolean(editorState.panels.issuesPanel.isOpen));
      if (editorState.panels.issuesPanel.activeTab === "execution") {
        setBottomPanelTab("execution");
      } else if (editorState.panels.issuesPanel.activeTab === "problems") {
        setBottomPanelTab("problems");
      }
    }

    if (editorState?.settings) {
      setShowFieldIssues(Boolean(editorState.settings.showFieldIssues));
    }

    setToolDraft(null);
    setFocusFieldPath(null);
    setIssues([]);
    setExecution(null);
    setNodeRuns({});
    setNodeRunOrder([]);

    if (editorState?.viewport) {
      const viewport = editorState.viewport;
      requestAnimationFrame(() => {
        reactFlow.setViewport(viewport, { duration: 0 });
      });
    }

    setGraphStatus("idle");
  }, [graphStatus, reactFlow, setEdges, setNodes]);

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

  const requestToolDraft = useCallback(
    (agentId: string, targetHandle: "tool" | "memory" = "tool") => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const agentNode = currentNodes.find((node) => node.id === agentId);
    if (!agentNode) return;

    const toolIndex = currentEdges.filter(
      (edge) => edge.target === agentId && edge.targetHandle === targetHandle
    ).length;

    const draft: ToolDraft = {
      agentId,
      position: {
        x: agentNode.position.x,
        y: agentNode.position.y + 220 + toolIndex * 140,
      },
      targetHandle,
    };

    setToolDraft(draft);
    setSelectedNodeId(null);
    setInspectorOpen(true);
  },
    []
  );

  const confirmToolSelection = useCallback(
    (option: ToolOption) => {
      setToolDraft((draft) => {
        if (!draft) return draft;

        const nodeId = nextId();
        const edgeId = `edge-${nodeId}-${draft.agentId}-${draft.targetHandle}`;

        const toolConfig = {
          ...createDefaultNodeConfig("tool"),
          toolId: option.id,
          toolName: option.title,
          ...(option.id === "http_request"
            ? { httpRequest: createDefaultHttpRequestToolConfig() }
            : {}),
          ...(option.id === "google_sheets"
            ? (() => {
                const baseConfig = createDefaultGoogleSheetsToolConfig();
                return {
                  googleSheets: {
                    ...baseConfig,
                    meta: {
                      ...baseConfig.meta,
                      toolName: option.title,
                      toolDescription: option.description,
                    },
                  },
                };
              })()
            : {}),
        };

        const toolNode: Node<DefinitionNode> = {
          id: nodeId,
          type: "appNode",
          position: draft.position,
          data: {
            id: nodeId,
            kind: "tool",
            name: option.title,
            enabled: true,
            meta: { description: option.description },
            config: toolConfig,
          } satisfies ToolDefinitionNode,
        };

        setNodes((nds) => nds.concat(toolNode));
        setEdges((eds) =>
          addEdge(
            {
              id: edgeId,
              source: nodeId,
              sourceHandle: "out",
              target: draft.agentId,
              targetHandle: draft.targetHandle,
              type: "custom",
            },
            eds
          )
        );

        setSelectedNodeId(nodeId);
        setInspectorOpen(true);

        return null;
      });
    },
    [setEdges, setNodes]
  );

  const cancelToolDraft = useCallback(() => {
    setToolDraft(null);
    setInspectorOpen(false);
  }, []);

  const focusNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((item) => item.id === nodeId);
      if (!node) return;
      reactFlow.setCenter(node.position.x + 120, node.position.y + 60, {
        zoom: 1.05,
        duration: 280,
      });
    },
    [reactFlow]
  );

  const runValidation = useCallback(() => {
    setGraphStatus("validating");
    const result = validateGraphOnSubmit(
      nodesRef.current.map((node) => node.data),
      edgesRef.current
    );
    setIssues(result.issues);
    setIssuesOpen(result.issues.length > 0);
    setShowFieldIssues(true);
    if (result.errors.length > 0) {
      setGraphStatus("failed_compile");
    } else {
      setGraphStatus("ready");
    }
    return result;
  }, []);

  const onExecute = useCallback(async () => {
    const validation = runValidation();
    if (validation.errors.length > 0 || !validation.plan) {
      return;
    }

    const executionId = `exec-${Date.now()}`;
    const executionStartedAt = Date.now();
    setExecution({
      id: executionId,
      status: "running",
      startedAt: executionStartedAt,
    });
    setBottomPanelTab("execution");
    setNodeRunOrder(validation.plan.nodesInOrder);
    setNodeRuns(() => {
      const next: Record<string, NodeRun> = {};
      validation.plan?.nodesInOrder.forEach((nodeId) => {
        next[nodeId] = {
          nodeId,
          status: "pending",
        };
      });
      return next;
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGraphStatus("running");
    setNodeStatuses((prev) => {
      const next: Record<string, NodeRunStatus> = { ...prev };
      nodesRef.current.forEach((node) => {
        next[node.id] = validation.plan?.nodesInOrder.includes(node.id)
          ? "pending"
          : "idle";
      });
      return next;
    });

    const result = await runGraph(validation.plan, {
      signal: controller.signal,
      onNodeStatus: (nodeId, status) => {
        const now = Date.now();
        setNodeStatuses((prev) => ({
          ...prev,
          [nodeId]: status,
        }));
        setNodeRuns((prev) => {
          const existing = prev[nodeId] ?? { nodeId, status };
          if (status === "running") {
            return {
              ...prev,
              [nodeId]: {
                ...existing,
                status,
                startedAt: now,
              },
            };
          }
          if (status === "succeeded") {
            const startedAt = existing.startedAt ?? now;
            const durationMs = Math.max(0, now - startedAt);
            return {
              ...prev,
              [nodeId]: {
                ...existing,
                status,
                startedAt,
                finishedAt: now,
                durationMs,
                output: { ok: true, nodeId },
                outputSummary: "OK",
              },
            };
          }
          if (status === "failed") {
            return {
              ...prev,
              [nodeId]: {
                ...existing,
                status,
                finishedAt: now,
                error: {
                  message: "Ошибка выполнения",
                },
              },
            };
          }
          return {
            ...prev,
            [nodeId]: {
              ...existing,
              status,
            },
          };
        });
      },
    });
    abortControllerRef.current = null;

    const finishedAt = Date.now();
    if (result.status === "cancelled") {
      setGraphStatus("cancelled");
      setExecution((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
              finishedAt,
              durationMs: finishedAt - prev.startedAt,
            }
          : prev
      );
      setNodeStatuses((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] === "pending" || next[id] === "running") {
            next[id] = "skipped";
          }
        });
        return next;
      });
      setNodeRuns((prev) => {
        const next: Record<string, NodeRun> = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id].status === "pending") {
            next[id] = { ...next[id], status: "skipped", finishedAt };
          } else if (next[id].status === "running") {
            next[id] = { ...next[id], status: "cancelled", finishedAt };
          }
        });
        return next;
      });
    } else if (result.status === "failed_runtime") {
      setGraphStatus("failed_runtime");
      setExecution((prev) =>
        prev
          ? {
              ...prev,
              status: "failed",
              finishedAt,
              durationMs: finishedAt - prev.startedAt,
            }
          : prev
      );
    } else {
      setGraphStatus("succeeded");
      setExecution((prev) =>
        prev
          ? {
              ...prev,
              status: "succeeded",
              finishedAt,
              durationMs: finishedAt - prev.startedAt,
            }
          : prev
      );
    }

    if (result.issues.length > 0) {
      setIssues((prev) => prev.concat(result.issues));
      setIssuesOpen(true);
    }
  }, [runValidation]);

  const onValidate = useCallback(() => {
    runValidation();
  }, [runValidation]);

  const onStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const onSelectIssue = useCallback(
    (issue: Issue) => {
      if (issue.nodeId) {
        setSelectedNodeId(issue.nodeId);
        setInspectorOpen(true);
        setInspectorTabId("general");
        focusNode(issue.nodeId);
      }
      setFocusFieldPath(issue.fieldPath ?? null);
    },
    [focusNode]
  );

  const onSelectNodeRun = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setInspectorOpen(true);
      setInspectorTabId("output");
      setFocusFieldPath(null);
      focusNode(nodeId);
    },
    [focusNode]
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((x) => x.id === selectedNodeId);
    return n ? { id: n.id, data: n.data } : null;
  }, [nodes, selectedNodeId]);

  const nodeRunList = useMemo(
    () => nodeRunOrder.map((id) => nodeRuns[id]).filter(Boolean) as NodeRun[],
    [nodeRunOrder, nodeRuns]
  );

  const selectedNodeRun = useMemo(
    () => (selectedNodeId ? nodeRuns[selectedNodeId] ?? null : null),
    [nodeRuns, selectedNodeId]
  );

  const nodeIssuesById = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    issues.forEach((issue) => {
      if (!issue.nodeId) return;
      if (!map[issue.nodeId]) {
        map[issue.nodeId] = [];
      }
      map[issue.nodeId].push(issue);
    });
    return map;
  }, [issues]);

  const fieldIssueMap = useMemo(() => {
    const map: Record<string, Issue> = {};
    issues.forEach((issue) => {
      if (!issue.nodeId || !issue.fieldPath) return;
      const key = `${issue.nodeId}:${issue.fieldPath}`;
      const existing = map[key];
      if (!existing) {
        map[key] = issue;
        return;
      }
      if (existing.severity !== "error" && issue.severity === "error") {
        map[key] = issue;
      }
    });
    return map;
  }, [issues]);

  const edgeIssuesById = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    issues.forEach((issue) => {
      if (!issue.edgeId) return;
      if (!map[issue.edgeId]) {
        map[issue.edgeId] = [];
      }
      map[issue.edgeId].push(issue);
    });
    return map;
  }, [issues]);

  const edgesWithRuntime = useMemo(() => {
    return edges.map((edge) => {
      const edgeIssues = edgeIssuesById[edge.id] ?? [];
      const severity = edgeIssues.some((i) => i.severity === "error")
        ? "error"
        : edgeIssues.some((i) => i.severity === "warning")
        ? "warning"
        : null;
      const className = [
        edge.className ?? "",
        severity ? `edge-${severity}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return {
        ...edge,
        className,
      };
    });
  }, [edgeIssuesById, edges]);

  const errorsCount = useMemo(
    () => issues.filter((issue) => issue.severity === "error").length,
    [issues]
  );
  const warningsCount = useMemo(
    () => issues.filter((issue) => issue.severity === "warning").length,
    [issues]
  );
  const missingRequired = useMemo(
    () =>
      issues.filter(
        (issue) => issue.severity === "error" && issue.kind === "field"
      ).length,
    [issues]
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

  const toolDraftActions = toolDraft
    ? {
        onSelect: confirmToolSelection,
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

  const edgeTypes = useMemo<EdgeTypes>(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  return (
    <GraphRuntimeProvider
      value={{ nodeStatuses, nodeIssues: nodeIssuesById }}
    >
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          width: "100%",
          height: "100%",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <NodePalette />
          <FlowCanvas
            nodes={nodes}
            edges={edgesWithRuntime}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            isValidConnection={isValidConnection}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onCreateNode={onCreateNode}
            onNodeClick={(_, node) => {
              if (toolDraft) return;
              setSelectedNodeId(node.id);
              setInspectorOpen(true);
              setFocusFieldPath(null);
            }}
            onPaneClick={() => {
              if (toolDraft) return;
              setSelectedNodeId(null);
              setFocusFieldPath(null);
            }}
            canvasActions={
              <GraphCanvasActions
                hasNodes={nodes.length > 0}
                isRunning={graphStatus === "running" || graphStatus === "validating"}
                showFieldIssues={showFieldIssues}
                onExecute={onExecute}
                onValidate={onValidate}
                onStop={onStop}
                onExport={onExport}
                onLoad={onLoad}
                onToggleShowFieldIssues={() =>
                  setShowFieldIssues((prev) => !prev)
                }
              />
            }
          />
          <NodeInspector
            open={inspectorOpen}
            width={inspectorWidth}
            selectedNode={selectedNode}
            activeTabId={inspectorTabId}
            execution={execution}
            nodeRun={selectedNodeRun}
            focusFieldPath={focusFieldPath}
            fieldIssueMap={fieldIssueMap}
            showFieldIssues={showFieldIssues}
            toolDraft={toolDraftActions}
            onClose={() => {
              if (toolDraft) {
                cancelToolDraft();
                return;
              }
              setInspectorOpen(false);
            }}
            onUpdate={updateNodeData}
            onTabChange={setInspectorTabId}
            onWidthChange={setInspectorWidth}
          />
        </Box>

        <IssuesPanel
          open={issuesOpen}
          status={graphStatus}
          activeTab={bottomPanelTab}
          onTabChange={setBottomPanelTab}
          issues={issues}
          errorsCount={errorsCount}
          warningsCount={warningsCount}
          missingRequired={missingRequired}
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          edges={edges}
          execution={execution}
          nodeRuns={nodeRunList}
          onToggleOpen={() => setIssuesOpen((prev) => !prev)}
          onSelectIssue={onSelectIssue}
          onSelectNodeRun={onSelectNodeRun}
        />
      </Box>
    </GraphRuntimeProvider>
  );
}
