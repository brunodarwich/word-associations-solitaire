import { Crown, Plus } from "lucide-react";
import type { Board, Card, Destination, PlayAction } from "./types";
export function Foundations({
  b,
  card,
  suggestion,
  playing,
  move,
  drop,
}: {
  b: Board;
  card: (id: string) => Card;
  suggestion?: PlayAction;
  playing: boolean;
  move: (to: Destination) => void;
  drop: (e: React.DragEvent, to: Destination) => void;
}) {
  return (
    <div className="foundations">
      {b.foundations.map((pile, index) => {
        const title = pile.length ? card(pile[0]) : null;
        const highlighted =
          suggestion?.type === "move" &&
          suggestion.to.type === "foundation" &&
          suggestion.to.index === index;
        return (
          <button
            key={index}
            data-foundation={index}
            className={`foundation ${title ? "occupied" : ""} ${highlighted ? "hinted" : ""}`}
            disabled={!playing}
            onClick={() => move({ type: "foundation", index })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => drop(e, { type: "foundation", index })}
            aria-label={`Espaço de categoria ${index + 1}${title ? `: ${title.text}, ${pile.length - 1} de 4 palavras` : ": vazio"}`}
          >
            {title ? (
              <>
                <Crown size={19} />
                <strong>{title.text}</strong>
                <span className="foundation-progress">
                  {[1, 2, 3, 4].map((n) => (
                    <i key={n} className={n < pile.length ? "filled" : ""} />
                  ))}
                  <small>{pile.length - 1}/4</small>
                </span>
              </>
            ) : (
              <>
                <Plus size={24} />
                <span>
                  Coloque uma
                  <br />
                  categoria aqui
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
