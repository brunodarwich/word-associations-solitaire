import { PlayingCard } from "./PlayingCard";
import { Foundations } from "./Foundations";
import { Columns } from "./Columns";
import { BoardAside } from "./BoardAside";
import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Lightbulb,
  Crown,
  ArrowDown,
  MousePointer2,
} from "lucide-react";
import { hint, status } from "./engine";
import type { Action, Destination, Game, Level, PlayAction } from "./types";
export function Board({
  level,
  game,
  dispatch,
  onBack,
  onRestart,
}: {
  level: Level;
  game: Game;
  dispatch: (a: Action) => boolean;
  onBack: () => void;
  onRestart: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [suggestion, setSuggestion] = useState<PlayAction | undefined>(),
    [message, setMessage] = useState("");
  const b = game.board,
    playing = status(level, game) === "playing";
  const card = (id: string) => level.cards.find((c) => c.id === id)!;
  function send(a: Action) {
    const ok = dispatch(a);
    if (ok) {
      setSelected(null);
      setSuggestion(undefined);
      setMessage("");
    } else
      setMessage(
        "Essa carta não pode ir para esse lugar. Tente outra conexão.",
      );
    return ok;
  }
  function move(to: Destination, id = selected) {
    if (id) send({ type: "move", card: id, to });
    else setMessage("Selecione uma carta disponível primeiro.");
  }
  function select(id: string, column?: number) {
    if (selected === id) {
      setSelected(null);
      return;
    }
    if (selected && column !== undefined) {
      move({ type: "column", index: column });
      return;
    }
    setSelected(id);
    setMessage(
      `${card(id).text} selecionada. Escolha uma categoria ou coluna.`,
    );
  }
  function drop(e: React.DragEvent, to: Destination) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) move(to, id);
  }
  const hintCard = suggestion?.type === "move" ? suggestion.card : undefined;
  const renderCard = (id: string, available: boolean, column?: number) => (
    <PlayingCard
      key={id}
      card={card(id)}
      revealed={b.revealed.includes(id)}
      available={available}
      selected={selected === id}
      hinted={hintCard === id}
      playing={playing}
      onSelect={() => select(id, column)}
      onDragSelect={() => setSelected(id)}
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
      <div className="game-topline">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={16} /> Todas as fases
        </button>
        <span className="game-chapter">
          CAPÍTULO {Math.ceil(level.id / 5)} · FASE{" "}
          {String(level.id).padStart(2, "0")}
        </span>
      </div>
      <div className="game-heading">
        <div>
          <div className="eyebrow">ENCONTRE AS CONEXÕES</div>
          <h1>{level.title}</h1>
        </div>
        <div
          className={`move-counter ${b.moves < 8 ? "low" : ""}`}
          aria-label={`${b.moves} jogadas restantes${b.moves < 8 ? ", atenção ao limite" : ""}`}
        >
          <strong>{b.moves}</strong>
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
      <div className="game-layout">
        <section className="table" aria-label="Mesa de jogo">
          <div className={`selection-guide ${selected ? "has-selection" : ""}`}>
            <p className="game-message" role="status" aria-live="polite">
              {message ||
                (selected
                  ? "Escolha o destino da carta selecionada."
                  : "Toque em uma carta e depois no destino.")}
            </p>
            {selected && (
              <button
                className="text-button"
                onClick={() => {
                  setSelected(null);
                  setMessage("");
                }}
              >
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
            drop={drop}
          />{" "}
          <div className="table-divider">
            <span>SUAS CARTAS</span>
            <span>
              <MousePointer2 size={12} /> Selecione e escolha o destino
            </span>
          </div>
          <Columns
            b={b}
            playing={playing}
            move={move}
            drop={drop}
            renderCard={renderCard}
          />{" "}
          <div className="stock-area">
            <div className="stock-pair">
              <div>
                <button
                  className={`stock ${suggestion?.type === "draw" || suggestion?.type === "recycle" ? "hinted" : ""}`}
                  disabled={!playing || (!b.stock.length && !b.waste.length)}
                  onClick={() =>
                    send({ type: b.stock.length ? "draw" : "recycle" })
                  }
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
                  renderCard(b.waste.at(-1)!, true)
                ) : (
                  <div className="waste-empty">
                    <ArrowDown size={20} />
                  </div>
                )}
                <small>Descarte · {b.waste.length}</small>
              </div>
            </div>
            <p>
              Uma carta por vez.
              <br />
              Uma nova possibilidade.
            </p>
          </div>
          <div className="board-toolbar">
            <button
              disabled={!playing || game.hintsUsed >= 3}
              onClick={() => {
                const a = hint(level, game);
                if (a && dispatch({ type: "hint" })) {
                  setSuggestion(a);
                  setSelected(null);
                  setMessage(
                    a.type === "move"
                      ? `Dica: mova “${card(a.card).text}” para ${a.to.type === "foundation" ? `o espaço de categoria ${a.to.index + 1}` : `a coluna ${a.to.index + 1}`}.`
                      : a.type === "draw"
                        ? "Dica: compre uma carta do monte."
                        : "Dica: recicle o descarte.",
                  );
                } else
                  setMessage(
                    "Nenhuma dica disponível agora. Tente desfazer ou reiniciar.",
                  );
              }}
            >
              <Lightbulb size={18} />
              <span>Dica</span>
              <b>{3 - game.hintsUsed}</b>
            </button>
            <button
              disabled={
                !game.history.length ||
                game.undosUsed >= 3 ||
                status(level, game) === "won"
              }
              onClick={() => send({ type: "undo" })}
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
        </section>
        <BoardAside b={b} level={level} tutorial={tutorial} />
      </div>
    </main>
  );
}
