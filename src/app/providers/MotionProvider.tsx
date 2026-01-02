import type { ReactNode } from "react";
import React from "react";

import { createTransition, motionTokens, motionVariants } from "../theme/motion";

type GraphEdgeAnimationMode = "off" | "selectedOnly" | "all";

type MotionSettings = {
  animationsEnabled: boolean;
  graphEdgeAnimations: GraphEdgeAnimationMode;
};

type MotionContextValue = {
  reducedMotion: boolean;
  settings: MotionSettings;
  transition: typeof createTransition;
  variants: typeof motionVariants;
};

const MotionContext = React.createContext<MotionContextValue | null>(null);

function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function useMotion() {
  const ctx = React.useContext(MotionContext);
  if (!ctx) {
    throw new Error("useMotion must be used inside MotionProvider");
  }
  return ctx;
}

export function useReducedMotion() {
  return useMotion().reducedMotion;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    getInitialReducedMotion
  );

  React.useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const handler = () => setPrefersReducedMotion(media.matches);
    handler();
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, []);

  const settings = React.useMemo<MotionSettings>(
    () => ({
      animationsEnabled: true,
      graphEdgeAnimations: "selectedOnly",
    }),
    []
  );

  const reducedMotion = prefersReducedMotion || !settings.animationsEnabled;

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.reducedMotion = reducedMotion ? "true" : "false";
    root.dataset.edgeAnimations = settings.graphEdgeAnimations;
  }, [reducedMotion, settings.graphEdgeAnimations]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--motion-scale-hover",
      String(reducedMotion ? 1 : motionTokens.scale.hover)
    );
    root.style.setProperty(
      "--motion-scale-press",
      String(reducedMotion ? 1 : motionTokens.scale.press)
    );
  }, [reducedMotion]);

  const value = React.useMemo(
    () => ({
      reducedMotion,
      settings,
      transition: createTransition,
      variants: motionVariants,
    }),
    [reducedMotion, settings]
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}
