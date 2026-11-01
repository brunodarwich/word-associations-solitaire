import { PlayingCard } from "./PlayingCard";
import { Foundations } from "./Foundations";
import { Columns } from "./Columns";
import { BoardAside } from "./BoardAside";
import { useBoardInteraction } from "./useBoardInteraction";
import { DragPreview } from "./DragPreview";
import { Crown, MousePointer2 } from "lucide-react";
import { StockArea, BoardToolbar } from "./BoardControls";
import { GameHeading } from "./GameHeading";
import { status, stackFrom } from "./engine";
import type { Action, Game, Level } from "./types";
export function Board({
  level,
  game,
  dispatch,
  onBack,
  onRestart,
  interactionEnabled,
}: {
  level: Level;
  game: Game;
  dispatch: (a: Action) => boolean;
  onBack: () => void;
  onRestart: () => void;
  interactionEnabled: boolean;
}) {
  const {
    b,
    playing,
    card,
    selection,
    selected,
    suggestion,
    message,
    send,
    move,
    select,
    drag,
    destinationClass,
    showHint,
    cancelSelection,
  } = useBoardInteraction({ level, game, dispatch, interactionEnabled });
  const hintCard =
    suggestion?.type === "move" || suggestion?.type === "moveStack"
      ? suggestion.card
      : undefined;
  const renderCard = (id: string, column?: number) => (
    <PlayingCard
      key={id}
      card={card(id)}
      revealed={b.revealed.includes(id)}
      available={stackFrom(level, b, id).length > 0}
      selected={selection.includes(id)}
      hinted={hintCard === id}
      playing={playing}
      onSelect={() => select(id, column)}
      pointerHandlers={drag.bind(id)}
    />
  );
  const tutorial =
    level.id === 1
      ? "Comece por uma carta de categoria (♛). Leve-a a um dos três espaços acima e reúna suas quatro palavras."
      : level.id === 2
        ? "Mova cartas da mesma categoria entre colunas para descobrir o que está por baixo. Uma coluna vazia aceita qualquer carta."
        : level.id === 3
          ? "Toque no monte para comprar uma carta. Só a carta superior do descarte pode ser movida. Reciclar também custa uma jogada."
          : level.id === 4
            ? "Precisa de outra perspectiva? Use uma dica ou desfaça uma jogada. Você tem três de cada por tentativa."
            : undefined;
  return (
    <main className="game-page">
      {drag.drag && (
        <DragPreview
          cards={stackFrom(level, b, drag.drag.id).map(card)}
          x={drag.drag.x}
          y={drag.drag.y}
        />
      )}
      <GameHeading
        level={level}
        game={game}
        tutorial={tutorial}
        onBack={onBack}
      />
      <div className="game-layout">
        <section
          className="table"
          aria-label="Mesa de jogo"
          onClickCapture={drag.captureClick}
        >
          <div className={`selection-guide ${selected ? "has-selection" : ""}`}>
            <p className="game-message" role="status" aria-live="polite">
              {message ||
                (selected
                  ? "Escolha o destino da carta selecionada."
                  : "Toque em uma carta e depois no destino.")}
            </p>
            {selected && (
              <button className="text-button" onClick={cancelSelection}>
                Cancelar seleção
              </button>
            )}
          </div>
          <div className="table-meta">
            <span>
              <Crown size={15} /> CATEGORIAS
            </span>
            <span>
              {b.completed.length} de {level.groups.length} concluídas
            </span>
          </div>
          <progress
            className="collection-progress"
            value={b.completed.length}
            max={level.groups.length}
            aria-label="Categorias concluídas"
          />
          <Foundations
            b={b}
            card={card}
            suggestion={suggestion}
            playing={playing}
            move={move}
            destinationClass={destinationClass}
          />{" "}
          <div className="table-divider">
            <span>SUAS CARTAS</span>
            <span>
              <MousePointer2 size={12} /> Toque ou arraste
            </span>
          </div>
          <Columns
            b={b}
            playing={playing}
            move={move}
            destinationClass={destinationClass}
            renderCard={renderCard}
          />{" "}
          <StockArea
            game={game}
            playing={playing}
            suggestion={suggestion}
            send={send}
            renderCard={renderCard}
          />
          <BoardToolbar
            game={game}
            playing={playing}
            won={status(level, game) === "won"}
            onHint={showHint}
            onUndo={() => send({ type: "undo" })}
            onRestart={onRestart}
          />
        </section>
        <BoardAside b={b} level={level} tutorial={tutorial} />
      </div>
    </main>
  );
}
