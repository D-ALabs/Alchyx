import type * as React from "react";

interface OverlayLayer {
  id: symbol;
  ref: React.RefObject<HTMLElement | null>;
  blocksParentFocusTrap: boolean;
}

const layers: OverlayLayer[] = [];

export function registerOverlayLayer(layer: OverlayLayer): () => void {
  const existing = layers.findIndex(({ id }) => id === layer.id);
  if (existing >= 0) layers.splice(existing, 1);
  layers.push(layer);
  return () => {
    const index = layers.findIndex(({ id }) => id === layer.id);
    if (index >= 0) layers.splice(index, 1);
  };
}

export function isTopmostOverlayLayer(id: symbol): boolean {
  return layers.length > 0 && layers[layers.length - 1]?.id === id;
}

export function isTopmostOverlayElement(element: HTMLElement): boolean {
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (layer?.blocksParentFocusTrap) return layer.ref.current === element;
  }
  return true;
}
