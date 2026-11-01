import { Plus } from "lucide-react";
import type { Board, Destination } from "./types";
import type { ReactNode } from "react";
export function Columns({
  b,
  playing,
  move,
  drop,
  renderCard,
}: {
  b: Board;
  playing: boolean;
  move: (to: Destination) => void;
  drop: (e: React.DragEvent, to: Destination) => void;
  renderCard: (id: string, available: boolean, column?: number) => ReactNode;
}) {
  return (
    <div
      className="columns"
      style={{
        gridTemplateColumns: `repeat(${b.columns.length}, minmax(0,1fr))`,
      }}
    >
      {b.columns.map((pile, index) => (
        <div
          className="column"
          key={index}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            if (e.target === e.currentTarget)
              drop(e, { type: "column", index });
          }}
        >
          {pile.length ? (
            pile.map((id, j) => (
              <div
                className="card-wrap"
                key={id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.stopPropagation();
                  drop(e, { type: "column", index });
                }}
              >
                {renderCard(id, j === pile.length - 1, index)}
              </div>
            ))
          ) : (
            <button
              className="empty-column"
              data-column={index}
              aria-label={`Coluna vazia ${index + 1}`}
              disabled={!playing}
              onClick={() => move({ type: "column", index })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.stopPropagation();
                drop(e, { type: "column", index });
              }}
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
