import { createPortal } from "react-dom";
import type { Card } from "./types";
export function DragPreview({
  cards,
  x,
  y,
}: {
  cards: Card[];
  x: number;
  y: number;
}) {
  return createPortal(
    <div
      className="drag-preview"
      aria-hidden="true"
      style={{
        height: 104 + (cards.length - 1) * 24,
        left: Math.min(Math.max(8, x + 20), window.innerWidth - 120),
        top: Math.max(
          8,
          Math.min(y - 64, window.innerHeight - cards.length * 20 - 100),
        ),
      }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`drag-preview-card ${card.kind === "title" ? "title-card" : ""}`}
          style={{ top: i * 24 }}
        >
          <span>
            {card.kind === "title" ? "♛ " : ""}
            {card.text}
          </span>
        </div>
      ))}
      <b>
        {cards.length} {cards.length === 1 ? "carta" : "cartas"}
      </b>
    </div>,
    document.body,
  );
}
