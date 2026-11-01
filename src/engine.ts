import type { Action, Board, Game, Level, PlayAction } from "./types";
export const clone = <T>(x: T): T => structuredClone(x);
export function createGame(l: Level): Game {
  return {
    levelId: l.id,
    board: clone(l.initial),
    history: [],
    hintsUsed: 0,
    undosUsed: 0,
  };
}
export function status(l: Level, g: Game) {
  return g.board.completed.length === l.groups.length
    ? "won"
    : g.board.moves === 0
      ? "lost"
      : "playing";
}
export function stars(g: Game) {
  return 1 + Number(g.hintsUsed === 0) + Number(g.undosUsed === 0);
}
export function playable(b: Board): string[] {
  return [...b.columns.map((c) => c.at(-1)), b.waste.at(-1)].filter(
    (x): x is string => !!x,
  );
}
export function legal(l: Level, b: Board, a: PlayAction): boolean {
  if (a.type === "draw") return b.stock.length > 0;
  if (a.type === "recycle") return !b.stock.length && b.waste.length > 0;
  const card = l.cards.find((c) => c.id === a.card);
  const ids =
    a.type === "moveStack"
      ? stackFrom(l, b, a.card)
      : playable(b).includes(a.card)
        ? [a.card]
        : [];
  if (!card || !ids.length || !Number.isInteger(a.to.index)) return false;
  if (a.to.type === "column") {
    const pile = b.columns[a.to.index];
    if (!pile || pile.includes(a.card)) return false;
    return (
      !pile.length ||
      l.cards.find((c) => c.id === pile.at(-1))!.group === card.group
    );
  }
  const pile = b.foundations[a.to.index];
  if (!pile) return false;
  const cards = ids.map((id) => l.cards.find((c) => c.id === id)!);
  return !pile.length
    ? cards.some((c) => c.kind === "title") && cards.length <= 5
    : cards.every((c) => c.kind === "word") &&
        pile.length + cards.length <= 5 &&
        l.cards.find((c) => c.id === pile[0])!.group === card.group;
}
// A selectable run is a complete exposed suffix, never a subset of its tail.
export function stackFrom(l: Level, b: Board, id: string): string[] {
  if (b.waste.at(-1) === id && b.revealed.includes(id)) return [id];
  const source = b.columns.find((p) => p.includes(id));
  if (!source) return [];
  const ids = source.slice(source.indexOf(id));
  const first = l.cards.find((c) => c.id === id);
  return first &&
    ids.every(
      (x) =>
        b.revealed.includes(x) &&
        l.cards.find((c) => c.id === x)?.group === first.group,
    )
    ? ids
    : [];
}
export function hint(l: Level, g: Game): PlayAction | undefined {
  if (status(l, g) !== "playing") return;
  const b = g.board,
    available = [...b.columns.flat(), ...b.waste.slice(-1)].filter(
      (id) => stackFrom(l, b, id).length,
    );
  const foundations: PlayAction[] = available
    .flatMap((card) =>
      b.foundations.map((_, index) => ({
        type:
          stackFrom(l, b, card).length > 1
            ? ("moveStack" as const)
            : ("move" as const),
        card,
        to: { type: "foundation" as const, index },
      })),
    )
    .filter((a) => legal(l, b, a));
  foundations.sort((a, c) => {
    if (
      (a.type !== "move" && a.type !== "moveStack") ||
      (c.type !== "move" && c.type !== "moveStack")
    )
      return 0;
    return (
      stackFrom(l, b, c.card).length - stackFrom(l, b, a.card).length ||
      b.foundations[c.to.index].length - b.foundations[a.to.index].length
    );
  });
  if (foundations.length) return foundations[0];
  // Prefer a move from the known solution when it is currently legal.
  const witness = l.solution.find((a) => a.type === "move" && legal(l, b, a));
  if (witness) return witness;
  // Free a hidden card, then free the waste. Avoid suggesting an empty-to-empty shuffle.
  for (const card of available) {
    const source = b.columns.findIndex((p) => p.includes(card));
    const ids = stackFrom(l, b, card);
    if (source >= 0 && b.columns[source].length === ids.length) continue;
    for (let index = 0; index < b.columns.length; index++) {
      const a: PlayAction = {
        type: ids.length > 1 ? "moveStack" : "move",
        card,
        to: { type: "column", index },
      };
      if (legal(l, b, a)) return a;
    }
  }
  if (b.stock.length) return { type: "draw" };
  if (b.waste.length) return { type: "recycle" };
}
export function act(l: Level, g: Game, a: Action): Game {
  if (a.type === "undo") {
    if (g.undosUsed >= 3 || !g.history.length || status(l, g) === "won")
      return g;
    return {
      ...g,
      board: clone(g.history.at(-1)!),
      history: g.history.slice(0, -1),
      undosUsed: g.undosUsed + 1,
    };
  }
  if (status(l, g) !== "playing") return g;
  if (a.type === "hint")
    return g.hintsUsed < 3 && hint(l, g)
      ? { ...g, hintsUsed: g.hintsUsed + 1 }
      : g;
  if (!legal(l, g.board, a)) return g;
  const b = clone(g.board);
  if (a.type === "draw") {
    const card = b.stock.pop()!;
    b.waste.push(card);
    if (!b.revealed.includes(card)) b.revealed.push(card);
  } else if (a.type === "recycle") {
    b.stock = b.waste.slice().reverse();
    b.waste = [];
  } else {
    const ids = a.type === "moveStack" ? stackFrom(l, b, a.card) : [a.card];
    const source = b.columns.find((c) => c.includes(a.card));
    if (source) {
      source.splice(source.length - ids.length);
      const top = source.at(-1);
      if (top && !b.revealed.includes(top)) b.revealed.push(top);
    } else b.waste.pop();
    const dest =
      a.to.type === "column"
        ? b.columns[a.to.index]
        : b.foundations[a.to.index];
    if (a.to.type === "foundation" && !dest.length)
      ids.sort(
        (x, y) =>
          Number(l.cards.find((c) => c.id === y)!.kind === "title") -
          Number(l.cards.find((c) => c.id === x)!.kind === "title"),
      );
    dest.push(...ids);
    if (a.to.type === "foundation" && dest.length === 5) {
      b.completed.push(l.cards.find((c) => c.id === a.card)!.group);
      b.foundations[a.to.index] = [];
    }
  }
  b.moves--;
  return { ...g, board: b, history: [...g.history.slice(-2), clone(g.board)] };
}
