import type { EditorLayout, WorkflowDefinition } from "../types";
import type { WorkflowDto } from "./toDto";

export function fromDto(dto: WorkflowDto): {
  definition: WorkflowDefinition;
  layout: EditorLayout;
} {
  return { definition: dto.definition, layout: dto.layout };
}
