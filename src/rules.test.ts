import { it, expect } from "vitest";
import { levels } from "./levels";
import { act, createGame, status, hint } from "./engine";

const level = levels[0];
it("permite empilhar somente a mesma categoria e revela a carta descoberta sem custo extra", () => {
  const g = createGame(level);
  g.board.columns = [["1-0-1", "1-0-2"], ["1-0-0"], ["1-1-1"], []];
  g.board.revealed = ["1-0-2", "1-0-0", "1-1-1"];
  const invalid = act(level, g, {
    type: "move",
    card: "1-0-2",
    to: { type: "column", index: 2 },
  });
  expect(invalid).toBe(g);
  const next = act(level, g, {
    type: "move",
    card: "1-0-2",
    to: { type: "column", index: 1 },
  });
  expect(next.board.columns[1]).toEqual(["1-0-0", "1-0-2"]);
  expect(next.board.revealed).toContain("1-0-1");
  expect(next.board.moves).toBe(g.board.moves - 1);
  const empty = act(level, next, {
    type: "move",
    card: "1-1-1",
    to: { type: "column", index: 3 },
  });
  expect(empty.board.columns[3]).toEqual(["1-1-1"]);
});
it("exige título para abrir uma fundação e a categoria correta para preenchê-la", () => {
  const g = createGame(level);
  g.board.columns = [["1-0-0"], ["1-0-1"], ["1-1-1"], []];
  g.board.revealed = g.board.columns.flat();
  expect(
    act(level, g, {
      type: "move",
      card: "1-0-1",
      to: { type: "foundation", index: 0 },
    }),
  ).toBe(g);
  const opened = act(level, g, {
    type: "move",
    card: "1-0-0",
    to: { type: "foundation", index: 0 },
  });
  expect(
    act(level, opened, {
      type: "move",
      card: "1-1-1",
      to: { type: "foundation", index: 0 },
    }),
  ).toBe(opened);
  expect(
    act(level, opened, {
      type: "move",
      card: "1-0-1",
      to: { type: "foundation", index: 0 },
    }).board.foundations[0],
  ).toHaveLength(2);
});
it("compra e recicla em ordem determinística, custando uma jogada cada", () => {
  let g = createGame(level);
  expect(act(level, g, { type: "recycle" })).toBe(g);
  const original = g.board.stock.slice(),
    budget = g.board.moves;
  for (let i = 0; i < original.length; i++) g = act(level, g, { type: "draw" });
  expect(g.board.waste).toEqual(original.slice().reverse());
  expect(act(level, g, { type: "draw" })).toBe(g);
  g = act(level, g, { type: "recycle" });
  expect(g.board.stock).toEqual(original);
  expect(g.board.waste).toEqual([]);
  expect(g.board.moves).toBe(budget - original.length - 1);
  g = act(level, g, { type: "draw" });
  expect(g.board.waste).toEqual([original.at(-1)]);
});
it("limita desfazeres e mantém histórico suficiente para exatamente três ações", () => {
  let g = createGame(level);
  for (const a of level.solution.slice(0, 4)) g = act(level, g, a);
  expect(g.history).toHaveLength(3);
  for (let i = 0; i < 3; i++) g = act(level, g, { type: "undo" });
  expect(g.undosUsed).toBe(3);
  expect(g.board.moves).toBe(level.limit - 1);
  expect(act(level, g, { type: "undo" })).toBe(g);
});
it("permite desfazer a derrota e não consome dica sem ação sugerida", () => {
  let g = createGame(level);
  g.board.moves = 1;
  g = act(level, g, level.solution[0]);
  expect(status(level, g)).toBe("lost");
  expect(hint(level, g)).toBeUndefined();
  expect(act(level, g, { type: "hint" })).toBe(g);
  g = act(level, g, { type: "undo" });
  expect(status(level, g)).toBe("playing");
  expect(g.board.moves).toBe(1);
});
