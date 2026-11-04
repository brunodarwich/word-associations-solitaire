import { ArrowLeft } from "lucide-react";
import type { Game, Level } from "./types";

export function GameHeading({
  level,
  game,
  tutorial,
  onBack,
}: {
  level: Level;
  game: Game;
  tutorial?: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="game-topline">
        <button
          className="text-button"
          onClick={onBack}
          aria-label="Todas as fases"
        >
          <ArrowLeft size={16} />
          <span className="back-label">Todas as fases</span>
        </button>
        <span className="game-chapter">
          CAPÍTULO {Math.ceil(level.id / 5)} · FASE{" "}
          {String(level.id).padStart(2, "0")}
        </span>
      </div>
      <div className="game-heading">
        <div>
          <div className="eyebrow">
            {level.cards.length} CARTAS · {level.groups.length} GRUPOS
          </div>
          <h1>{level.title}</h1>
        </div>
        <div
          className={`move-counter ${game.board.moves < 8 ? "low" : ""}`}
          aria-label={`${game.board.moves} jogadas restantes${game.board.moves < 8 ? ", atenção ao limite" : ""}`}
        >
          <strong>{game.board.moves}</strong>
          <span>
            jogadas
            <br />
            restantes
          </span>
        </div>
      </div>
      {tutorial && (
        <details className="mobile-tutorial">
          <summary>Como jogar esta fase</summary>
          <p>{tutorial}</p>
        </details>
      )}
    </>
  );
}
