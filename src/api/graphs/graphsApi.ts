import type { GraphExportPayload } from "../../types/graphExport";
import { MOCK_GRAPH_PAYLOAD } from "./mockGraphPayload";

export async function saveGraph(
  payload: GraphExportPayload
): Promise<{ ok: true; mockId: string }> {
  const json = JSON.stringify(payload, null, 2);
  console.groupCollapsed("[MOCK] saveGraph payload");
  console.log(json);
  console.groupEnd();
  try {
    await fetch("/api/graphs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
    });
  } catch {
    // ignore backend errors in mock mode
  }
  return { ok: true, mockId: `mock-${Date.now()}` };
}

export async function getGraph(graphId: string): Promise<GraphExportPayload> {
  const payload = JSON.parse(JSON.stringify(MOCK_GRAPH_PAYLOAD)) as GraphExportPayload;
  console.groupCollapsed("[MOCK] getGraph response");
  console.log(payload);
  console.groupEnd();
  return payload;
}
