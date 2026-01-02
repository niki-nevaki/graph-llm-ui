import { useTheme } from "@mui/material/styles";
import {
  BaseEdge,
  getSmoothStepPath,
  useStore,
  type EdgeProps,
} from "@xyflow/react";
import { useMemo, type CSSProperties } from "react";

import { useMotion } from "../../../../app/providers/MotionProvider";
import { EDGE_WIDTHS, getEdgeGeometry } from "./edgeStyles";

type CustomEdgeData = {
  active?: boolean;
};

const LARGE_GRAPH_THRESHOLD = 200;

export function CustomEdge(props: EdgeProps<CustomEdgeData>) {
  const theme = useTheme();
  const { reducedMotion, settings } = useMotion();
  const edgeCount = useStore((state) => state.edges.length);

  const { borderRadius, offset } = useMemo(
    () =>
      getEdgeGeometry(props.sourceX, props.sourceY, props.targetX, props.targetY),
    [props.sourceX, props.sourceY, props.targetX, props.targetY]
  );

  const [path] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius,
    offset,
  });

  const isActive = Boolean(props.data?.active || props.animated);
  const isLargeGraph = edgeCount > LARGE_GRAPH_THRESHOLD;
  const animationsEnabled =
    !reducedMotion && settings.graphEdgeAnimations !== "off";

  const allowFlow =
    animationsEnabled && (!isLargeGraph || settings.graphEdgeAnimations === "selectedOnly");

  const shouldFlow =
    allowFlow &&
    (settings.graphEdgeAnimations === "all" || props.selected || isActive);

  const shouldDraw = animationsEnabled && !isLargeGraph && !shouldFlow;

  const className = [
    "custom-edge-path",
    props.className ?? "",
    props.selected ? "is-selected" : "",
    isActive ? "is-active" : "",
    shouldFlow ? "is-flowing" : "",
    shouldDraw ? "is-entering" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties = {
    "--edge-width": `${EDGE_WIDTHS.base}px`,
    "--edge-width-hover": `${EDGE_WIDTHS.hover}px`,
    "--edge-width-active": `${EDGE_WIDTHS.active}px`,
    "--edge-width-selected": `${EDGE_WIDTHS.selected}px`,
    color: theme.palette.text.secondary,
    vectorEffect: "non-scaling-stroke",
    ...props.style,
  };

  return (
    <BaseEdge
      path={path}
      markerEnd={props.markerEnd}
      markerStart={props.markerStart}
      className={className}
      style={style}
      interactionWidth={props.interactionWidth ?? 28}
      pathLength={1}
    />
  );
}
