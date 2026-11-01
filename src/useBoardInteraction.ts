import { useEffect, useState } from "react";
import { useCardDrag } from "./useCardDrag";
import { hint, status, legal, stackFrom } from "./engine";
import type { Action, Destination, Game, Level, PlayAction } from "./types";
export function useBoardInteraction({
  level,
  game,
  dispatch,
  interactionEnabled,
}: {
  level: Level;
  game: Game;
  dispatch: (a: Action) => boolean;
  interactionEnabled: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [suggestion, setSuggestion] = useState<PlayAction | undefined>(),
    [message, setMessage] = useState("");
  const b = game.board,
    playing = status(level, game) === "playing" && interactionEnabled;
  const card = (id: string) => level.cards.find((c) => c.id === id)!;
  function send(a: Action) {
    const ok = dispatch(a);
    if (ok) {
      setSelected(null);
      setSuggestion(undefined);
      const count =
        a.type === "moveStack" ? stackFrom(level, b, a.card).length : 1;
      setMessage(
        a.type === "move" || a.type === "moveStack"
          ? `${count} ${count === 1 ? "carta movida" : "cartas movidas"}.`
          : a.type === "undo"
            ? "Jogada desfeita."
            : a.type === "draw"
              ? "Carta comprada do monte."
              : "Descarte reciclado.",
      );
    } else
      setMessage(
        "Essa carta não pode ir para esse lugar. Tente outra conexão.",
      );
    return ok;
  }
  function move(to: Destination, id = selected) {
    if (!id) {
      setMessage("Selecione uma carta disponível primeiro.");
      return false;
    }
    return send({ type: "moveStack", card: id, to });
  }
  const selection = selected ? stackFrom(level, b, selected) : [];
  function choose(id: string) {
    setSelected(id);
    const ids = stackFrom(level, b, id);
    setMessage(
      ids.length > 1
        ? `${ids.length} cartas selecionadas: ${ids.map((x) => card(x).text).join(", ")}. Escolha o destino.`
        : `${card(id).text} selecionada. Escolha uma categoria ou coluna.`,
    );
  }
  function select(id: string, column?: number) {
    if (selection.includes(id)) {
      setSelected(null);
      setMessage("");
      return;
    }
    if (
      selected &&
      column !== undefined &&
      !b.columns[column].includes(selected)
    ) {
      move({ type: "column", index: column });
      return;
    }
    choose(id);
  }
  const accepts = (id: string, to: Destination) =>
    playing && legal(level, b, { type: "moveStack", card: id, to });
  const drag = useCardDrag({
    enabled: playing,
    select: choose,
    move: (id, to) => move(to, id),
    accepts,
  });
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
        setMessage("");
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  function destinationClass(to: Destination) {
    const id = drag.drag?.id ?? selected;
    if (!id || !accepts(id, to)) return "";
    const over = drag.drag?.target;
    return `valid-destination ${over?.type === to.type && over.index === to.index ? "drag-over" : ""}`;
  }
  function showHint() {
    const action = hint(level, game);
    if (!action || !dispatch({ type: "hint" })) {
      setMessage("Nenhuma dica disponível agora. Tente desfazer ou reiniciar.");
      return;
    }
    setSuggestion(action);
    setSelected(null);
    if (action.type === "move" || action.type === "moveStack") {
      const count =
        action.type === "moveStack"
          ? stackFrom(level, b, action.card).length
          : 1;
      setMessage(
        `Dica: mova ${count > 1 ? `a pilha de ${count} cartas` : `“${card(action.card).text}”`} para ${action.to.type === "foundation" ? `o espaço de categoria ${action.to.index + 1}` : `a coluna ${action.to.index + 1}`}.`,
      );
    } else
      setMessage(
        action.type === "draw"
          ? "Dica: compre uma carta do monte."
          : "Dica: recicle o descarte.",
      );
  }
  function cancelSelection() {
    setSelected(null);
    setMessage("");
  }
  return {
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
  };
}
