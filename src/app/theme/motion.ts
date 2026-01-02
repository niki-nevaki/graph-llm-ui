export const motionTokens = {
  durations: {
    fast: 120,
    base: 180,
    slow: 240,
    slower: 320,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0.0, 0.0, 1)",
    emphasized: "cubic-bezier(0.2, 0.0, 0.0, 1.2)",
    linear: "linear",
  },
  distances: {
    slideY: 8,
    slideX: 10,
  },
  scale: {
    hover: 1.02,
    press: 0.98,
  },
};

export type MotionDurationKey = keyof typeof motionTokens.durations;
export type MotionEasingKey = keyof typeof motionTokens.easing;

export const createTransition = (
  properties: string | string[],
  duration: MotionDurationKey = "base",
  easing: MotionEasingKey = "standard"
) => {
  const props = Array.isArray(properties) ? properties.join(", ") : properties;
  return `${props} var(--motion-duration-${duration}) var(--motion-ease-${easing})`;
};

export const motionVariants = {
  fadeSlide: {
    hidden: {
      opacity: 0,
      transform: `translateY(${motionTokens.distances.slideY}px)`,
    },
    visible: { opacity: 1, transform: "translateY(0px)" },
    exit: { opacity: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
};
