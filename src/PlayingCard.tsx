import { Crown } from "lucide-react";
import type { Card } from "./types";
export function PlayingCard({
  card,
  revealed,
  available,
  selected,
  hinted,
  playing,
  onSelect,
  onDragSelect,
}: {
  card: Card;
  revealed: boolean;
  available: boolean;
  selected: boolean;
  hinted: boolean;
  playing: boolean;
  onSelect: () => void;
  onDragSelect: () => void;
}) {
  const id = card.id;
  if (!revealed)
    return (
      <div
        key={id}
        className="playing-card card-back"
        role="img"
        aria-label="Carta virada"
      >
        <span aria-hidden="true">✧</span>
      </div>
    );
  const cls = `playing-card ${card.kind === "title" ? "title-card" : ""} ${selected ? "selected" : ""} ${hinted ? "hinted" : ""}`;
  return available ? (
    <button
      key={id}
      data-card={id}
      className={cls}
      disabled={!playing}
      aria-pressed={selected}
      aria-label={`${card.kind === "title" ? "Categoria: " : ""}${card.text}`}
      draggable={playing}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        onDragSelect();
      }}
      onClick={() => onSelect()}
    >
      <span className="card-kind" aria-hidden="true">
        {card.kind === "title" ? <Crown size={14} /> : "✧"}
      </span>
      <strong>{card.text}</strong>
      {card.kind === "title" && <small>categoria</small>}
    </button>
  ) : (
    <div key={id} className={cls}>
      <span className="card-kind" aria-hidden="true">
        {card.kind === "title" ? <Crown size={14} /> : "✧"}
      </span>
      <strong>{card.text}</strong>
    </div>
  );
}
