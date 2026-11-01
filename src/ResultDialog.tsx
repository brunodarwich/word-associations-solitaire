import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { Modal } from "./Modal";
import { StarRow } from "./Screens";
import { stars } from "./engine";
import type { Game, Level } from "./types";
export function ResultDialog({
  game,
  level,
  result,
  onClose,
  onNext,
  onReplay,
  onUndo,
}: {
  game: Game;
  level: Level;
  result: string;
  onClose: () => void;
  onNext: () => void;
  onReplay: () => void;
  onUndo: () => void;
}) {
  return (
    <Modal
      title={
        result === "won"
          ? level.id === 30
            ? "Uma grande jornada de conexões."
            : "Tudo encontrou seu lugar."
          : "Toda conexão merece outra chance."
      }
      onClose={onClose}
    >
      {result === "won" ? (
        <>
          <div className="result-emblem">
            <Trophy size={38} />
          </div>
          <div className="result-stars">
            <StarRow count={stars(game)} />
          </div>
          <p className="result-text">
            {level.id === 30
              ? "Você concluiu as 30 fases de Paciência das Palavras. Agora, cada mesa é uma chance de se superar."
              : `Fase ${level.id} concluída com ${game.board.moves} jogadas restantes.`}
          </p>
          <ul className="star-explanation">
            <li>★ Fase concluída</li>
            <li>{game.hintsUsed ? "☆" : "★"} Sem usar dicas</li>
            <li>{game.undosUsed ? "☆" : "★"} Sem desfazer</li>
          </ul>
          <button className="primary full" onClick={onNext}>
            {level.id < 30 ? "Próxima descoberta" : "Revisitar minhas fases"}
            <ArrowRight size={17} />
          </button>
          <button className="text-button full" onClick={onReplay}>
            Jogar esta fase novamente
          </button>
        </>
      ) : (
        <>
          <p className="result-text">
            As jogadas acabaram. Tente outra estratégia: a distribuição será a
            mesma, e suas possibilidades continuam abertas.
          </p>
          <button className="primary full" onClick={onReplay}>
            Tentar novamente <RotateCcw size={17} />
          </button>
          {game.undosUsed < 3 && !!game.history.length && (
            <button className="text-button full" onClick={onUndo}>
              Desfazer a última jogada
            </button>
          )}
        </>
      )}
    </Modal>
  );
}
