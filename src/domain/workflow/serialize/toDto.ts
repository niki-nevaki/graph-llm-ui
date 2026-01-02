import type { EditorLayout, WorkflowDefinition } from "../types";

export type WorkflowDto = {
  definition: WorkflowDefinition;
  layout: EditorLayout;
};

export function toDto(
  definition: WorkflowDefinition,
  layout: EditorLayout
): WorkflowDto {
  return { definition, layout };
}
