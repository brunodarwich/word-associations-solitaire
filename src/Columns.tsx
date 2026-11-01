import { Plus } from "lucide-react";
import type { Board, Destination } from "./types";
import type { ReactNode } from "react";
export function Columns({
  b,
  playing,
  move,
  destinationClass,
  renderCard,
}: {
  b: Board;
  playing: boolean;
  move: (to: Destination) => void;
  destinationClass: (to: Destination) => string;
  renderCard: (id: string, column?: number) => ReactNode;
}) {
  return (
    <div
      className="columns-viewport"
      tabIndex={0}
      aria-label="Colunas de cartas, área rolável"
    >
      <div
        className="columns"
        style={{
          gridTemplateColumns: `repeat(${b.columns.length}, minmax(0,1fr))`,
        }}
      >
        {b.columns.map((pile, index) => (
          <div
            className={`column ${destinationClass({ type: "column", index })}`}
            data-drop-type="column"
            data-drop-index={index}
            key={index}
          >
            {pile.length ? (
              pile.map((id) => (
                <div className="card-wrap" key={id}>
                  {renderCard(id, index)}
                </div>
              ))
            ) : (
              <button
                className="empty-column"
                data-column={index}
                aria-label={`Coluna vazia ${index + 1}`}
                disabled={!playing}
                onClick={() => move({ type: "column", index })}
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
