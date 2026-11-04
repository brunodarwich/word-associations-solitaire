import { describe, it, expect } from "vitest";
import { act, createGame, legal, stackFrom, hint, status } from "./engine";
import { levels } from "./levels";
import { decode, defaultSave } from "./storage";
import type { Destination, Game } from "./types";

const level = levels[0];
const group = level.cards.filter((c) => c.group === 0).map((c) => c.id);
function setup(): Game {
  const game = createGame(level);
  game.board.columns = [["1-1-1", ...group.slice(0, 3)], [], [], []];
  const placed = game.board.columns.flat();
  game.board.stock = level.cards
    .map((c) => c.id)
    .filter((id) => !placed.includes(id));
  game.board.waste = [];
  game.board.revealed = group.slice(0, 3);
  return game;
}
const move = (
  game: Game,
  card = group[0],
  to: Destination = { type: "column", index: 1 },
) => act(level, game, { type: "moveStack", card, to });

describe("pilhas da mesma categoria", () => {
  it("move uma sequência inteira por uma jogada, revela a origem e desfaz atomicamente", () => {
    const game = setup();
    expect(stackFrom(level, game.board, group[0])).toEqual(group.slice(0, 3));
    const next = move(game);
    expect(next.board.columns[0]).toEqual(["1-1-1"]);
    expect(next.board.columns[1]).toEqual(group.slice(0, 3));
    expect(next.board.revealed).toContain("1-1-1");
    expect(next.board.moves).toBe(game.board.moves - 1);
    expect(next.history).toHaveLength(1);
    expect(act(level, next, { type: "undo" }).board).toEqual(game.board);
    expect(game.board.columns[0]).toHaveLength(4);
    const save = { ...defaultSave(), game: next };
    expect(decode(JSON.stringify(save))).toEqual(save);
  });
  it("rejeita origem oculta, categoria misturada, mesma coluna e destino incompatível sem custo", () => {
    const game = setup();
    expect(stackFrom(level, game.board, "1-1-1")).toEqual([]);
    expect(move(game, "1-1-1")).toBe(game);
    expect(move(game, group[0], { type: "column", index: 0 })).toBe(game);
    expect(move(game, group[0], { type: "column", index: 9 })).toBe(game);
    game.board.revealed.push("1-1-1");
    expect(stackFrom(level, game.board, "1-1-1")).toEqual([]);
    game.board.columns[1] = [game.board.stock.pop()!];
    expect(move(game)).toBe(game);
  });
  it("coleta palavras em grupo e normaliza um título em qualquer posição", () => {
    const game = setup();
    game.board.columns[0] = ["1-1-1", group[1], group[0], group[2]];
    const opened = move(game, group[1], { type: "foundation", index: 0 });
    expect(opened.board.foundations[0]).toEqual([group[0], group[1], group[2]]);
    opened.board.columns[1] = group.slice(3);
    opened.board.stock = opened.board.stock.filter(
      (id) => !group.slice(3).includes(id),
    );
    opened.board.revealed.push(...group.slice(3));
    const next = move(opened, group[3], { type: "foundation", index: 0 });
    expect(next.board.foundations[0]).toEqual([]);
    expect(next.board.completed).toEqual([0]);
    expect(next.board.moves).toBe(game.board.moves - 2);
    expect(
      decode(JSON.stringify({ ...defaultSave(), game: next })),
    ).not.toBeNull();
    expect(act(level, next, { type: "undo" }).board).toEqual(opened.board);
  });
  it("exige título para abrir coleta e mantém vitória prioritária na última jogada", () => {
    const game = setup();
    expect(move(game, group[1], { type: "foundation", index: 0 })).toBe(game);
    game.board.columns[0] = [...group];
    game.board.stock = game.board.stock.filter((id) => !group.includes(id));
    game.board.revealed = [...group];
    game.board.completed = level.groups.map((_, i) => i).slice(1);
    game.board.stock = [];
    game.board.moves = 1;
    const next = move(game, group[0], { type: "foundation", index: 0 });
    expect(status(level, next)).toBe("won");
    expect(next.board.moves).toBe(0);
    expect(
      decode(JSON.stringify({ ...defaultSave(), game: next })),
    ).not.toBeNull();
  });
  it("sugere a coleta da pilha inteira e preserva movimentos individuais", () => {
    const game = setup();
    const suggestion = hint(level, game)!;
    expect(suggestion.type).toBe("moveStack");
    expect(legal(level, game.board, suggestion)).toBe(true);
    expect(act(level, game, suggestion).board.foundations[0]).toHaveLength(3);
    const single = act(level, game, {
      type: "move",
      card: group[2],
      to: { type: "column", index: 1 },
    });
    expect(single.board.columns[1]).toEqual([group[2]]);
    expect(single.board.columns[0]).toHaveLength(3);
  });
  it("preserva a ordem ao empilhar, rejeita outra categoria na coleta e limita o descarte ao topo", () => {
    const game = setup();
    game.board.columns[1] = [group[3]];
    game.board.stock = game.board.stock.filter((id) => id !== group[3]);
    game.board.revealed.push(group[3]);
    const next = move(game);
    expect(next.board.columns[1]).toEqual([group[3], ...group.slice(0, 3)]);
    expect(
      decode(JSON.stringify({ ...defaultSave(), game: next })),
    ).not.toBeNull();
    const incompatible = setup();
    incompatible.board.stock = incompatible.board.stock.filter(
      (id) => id !== "1-1-0",
    );
    incompatible.board.foundations[0] = ["1-1-0"];
    incompatible.board.revealed.push("1-1-0");
    expect(move(incompatible, group[0], { type: "foundation", index: 0 })).toBe(
      incompatible,
    );
    const waste = setup();
    waste.board.waste = group.slice(3);
    waste.board.stock = waste.board.stock.filter(
      (id) => !waste.board.waste.includes(id),
    );
    waste.board.revealed.push(...waste.board.waste);
    expect(stackFrom(level, waste.board, group[3])).toEqual([]);
    expect(stackFrom(level, waste.board, group[4])).toEqual([group[4]]);
  });
});
