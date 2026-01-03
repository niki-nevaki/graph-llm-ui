import type { GraphExportPayload } from "../../types/graphExport";

export async function saveGraph(
  payload: GraphExportPayload
): Promise<{ ok: true; mockId: string }> {
  console.groupCollapsed("[MOCK] saveGraph payload");
  console.log(payload);
  console.groupEnd();
  return { ok: true, mockId: `mock-${Date.now()}` };
}
