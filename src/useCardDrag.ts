import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent } from "react";
import type { Destination } from "./types";

type Drag = {
  id: string;
  x: number;
  y: number;
  target: Destination | null;
};
type Gesture = {
  id: string;
  pointer: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moving: boolean;
  element: HTMLElement;
};
export function useCardDrag({
  enabled,
  select,
  move,
  accepts,
}: {
  enabled: boolean;
  select: (id: string) => void;
  move: (id: string, to: Destination) => boolean;
  accepts: (id: string, to: Destination) => boolean;
}) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef(0);
  const suppressed = useRef<{ id: string; until: number } | null>(null);
  const callbacks = useRef({ select, move, accepts });
  callbacks.current = { select, move, accepts };

  function destination(x: number, y: number): Destination | null {
    const node = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-drop-type]");
    const type = node?.dataset.dropType;
    return node && (type === "column" || type === "foundation")
      ? { type, index: Number(node.dataset.dropIndex) }
      : null;
  }
  function paint() {
    const current = gesture.current;
    if (!current?.moving) return;
    const target = destination(current.x, current.y);
    setDrag({
      id: current.id,
      x: current.x,
      y: current.y,
      target,
    });
  }
  function scroll() {
    const current = gesture.current;
    if (!current?.moving) return;
    const region = current.element
      .closest(".table")
      ?.querySelector<HTMLElement>(".columns-viewport");
    if (region) {
      const bounds = region.getBoundingClientRect();
      if (
        current.x >= bounds.left &&
        current.x <= bounds.right &&
        current.y >= bounds.top &&
        current.y <= bounds.bottom
      ) {
        const distance =
          current.y < bounds.top + 44
            ? current.y - bounds.top - 44
            : current.y > bounds.bottom - 44
              ? current.y - bounds.bottom + 44
              : 0;
        const previous = region.scrollTop;
        region.scrollTop += Math.max(-12, Math.min(12, distance / 3));
        if (region.scrollTop !== previous) paint();
      }
    }
    frame.current = requestAnimationFrame(scroll);
  }
  function cancel() {
    const current = gesture.current;
    if (current?.moving)
      suppressed.current = { id: current.id, until: Date.now() + 400 };
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    if (current?.element.hasPointerCapture(current.pointer))
      current.element.releasePointerCapture(current.pointer);
    setDrag(null);
  }
  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled]);
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    function blur() {
      cancel();
    }
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("blur", blur);
      cancelAnimationFrame(frame.current);
      const current = gesture.current;
      gesture.current = null;
      if (current?.element.hasPointerCapture(current.pointer))
        current.element.releasePointerCapture(current.pointer);
    };
  }, []);
  function down(event: ReactPointerEvent<HTMLElement>, id: string) {
    if (!enabled || !event.isPrimary || event.button !== 0 || gesture.current)
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      id,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moving: false,
      element: event.currentTarget,
    };
  }
  function update(event: ReactPointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    current.x = event.clientX;
    current.y = event.clientY;
    if (
      !current.moving &&
      Math.hypot(current.x - current.startX, current.y - current.startY) >= 8
    ) {
      current.moving = true;
      callbacks.current.select(current.id);
      frame.current = requestAnimationFrame(scroll);
    }
    if (current.moving) {
      event.preventDefault();
      paint();
    }
  }
  function up(event: ReactPointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (current.moving) {
      suppressed.current = { id: current.id, until: Date.now() + 400 };
      const target = destination(event.clientX, event.clientY);
      if (target && callbacks.current.accepts(current.id, target))
        callbacks.current.move(current.id, target);
    }
    cancel();
  }
  function captureClick(event: MouseEvent<HTMLElement>) {
    const source = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-card]",
    )?.dataset.card;
    const pending = suppressed.current;
    if (
      event.detail > 0 &&
      pending &&
      pending.id === source &&
      Date.now() < pending.until
    ) {
      event.preventDefault();
      event.stopPropagation();
      suppressed.current = null;
    }
  }
  return {
    drag,
    captureClick,
    bind: (id: string) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => down(event, id),
      onPointerMove: update,
      onPointerUp: up,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
    }),
  };
}
