export const EDGE_WIDTHS = {
  base: 1.6,
  hover: 2.4,
  active: 2.4,
  selected: 3,
};

type EdgeGeometry = {
  borderRadius: number;
  offset: number;
};

export const getEdgeGeometry = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): EdgeGeometry => {
  const dx = Math.abs(targetX - sourceX);
  const dy = Math.abs(targetY - sourceY);
  const distance = Math.hypot(dx, dy);
  const borderRadius = Math.max(6, Math.min(18, distance * 0.12));
  const offset = Math.max(12, Math.min(36, distance * 0.18));
  return { borderRadius, offset };
};
