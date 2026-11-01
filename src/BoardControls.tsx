import { ArrowDown, Lightbulb, RotateCcw, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Action, Game, PlayAction } from "./types";

export function StockArea({
  game,
  playing,
  suggestion,
  send,
  renderCard,
}: {
  game: Game;
  playing: boolean;
  suggestion?: PlayAction;
  send: (a: Action) => boolean;
  renderCard: (id: string) => ReactNode;
}) {
  const b = game.board;
  return (
    <div className="stock-area">
      <div className="stock-pair">
        <div>
          <button
            className={`stock ${suggestion?.type === "draw" || suggestion?.type === "recycle" ? "hinted" : ""}`}
            disabled={!playing || (!b.stock.length && !b.waste.length)}
            onClick={() => send({ type: b.stock.length ? "draw" : "recycle" })}
            aria-label={
              b.stock.length
                ? `Comprar carta, ${b.stock.length} no monte`
                : "Reciclar descarte"
            }
          >
            {b.stock.length ? (
              <span className="stock-mark">✧</span>
            ) : (
              <RotateCcw size={24} />
            )}
          </button>
          <small>Monte · {b.stock.length}</small>
        </div>
        <div className="waste">
          {b.waste.length ? (
            renderCard(b.waste.at(-1)!)
          ) : (
            <div className="waste-empty">
              <ArrowDown size={20} />
            </div>
          )}
          <small>Descarte · {b.waste.length}</small>
        </div>
      </div>
      <p>
        Mova uma carta ou uma pilha.
        <br />
        Uma nova possibilidade.
      </p>
    </div>
  );
}

export function BoardToolbar({
  game,
  playing,
  won,
  onHint,
  onUndo,
  onRestart,
}: {
  game: Game;
  playing: boolean;
  won: boolean;
  onHint: () => void;
  onUndo: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="board-toolbar">
      <button disabled={!playing || game.hintsUsed >= 3} onClick={onHint}>
        <Lightbulb size={18} />
        <span>Dica</span>
        <b>{3 - game.hintsUsed}</b>
      </button>
      <button
        disabled={!game.history.length || game.undosUsed >= 3 || won}
        onClick={onUndo}
      >
        <Undo2 size={18} />
        <span>Desfazer</span>
        <b>{3 - game.undosUsed}</b>
      </button>
      <button onClick={onRestart}>
        <RotateCcw size={17} />
        <span>Reiniciar</span>
      </button>
    </div>
  );
}
