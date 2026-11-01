import { describe, it, expect } from "vitest";
import { levels } from "./levels";
import { createGame, act, status, hint, stars } from "./engine";

describe("campanha", () => {
  it("possui 30 fases com palavras únicas e soluções legais dentro do limite", () => {
    expect(levels).toHaveLength(30);
    for (const level of levels) {
      const words = level.cards
        .filter((c) => c.kind === "word")
        .map((c) => c.text.normalize("NFC").toLocaleLowerCase("pt-BR"));
      expect(new Set(words).size).toBe(words.length);
      expect(words.length).toBe(level.groups.length * 4);
      let game = createGame(level);
      for (const action of level.solution) {
        const next = act(level, game, action);
        expect(next, `fase ${level.id}: ${JSON.stringify(action)}`).not.toBe(
          game,
        );
        game = next;
        const ids = [
          ...game.board.columns.flat(),
          ...game.board.stock,
          ...game.board.waste,
          ...game.board.foundations.flat(),
          ...game.board.completed.flatMap((g) =>
            level.cards.filter((c) => c.group === g).map((c) => c.id),
          ),
        ];
        expect(new Set(ids).size).toBe(level.cards.length);
        expect(ids.length).toBe(level.cards.length);
      }
      expect(status(level, game)).toBe("won");
      expect(game.board.moves).toBeGreaterThanOrEqual(0);
      expect(stars(game)).toBe(3);
    }
  });
  it("não cobra tentativas inválidas nem movimenta cartas ocultas", () => {
    const l = levels[0],
      g = createGame(l);
    expect(
      act(l, g, {
        type: "move",
        card: g.board.columns[0][0],
        to: { type: "foundation", index: 0 },
      }),
    ).toBe(g);
    expect(
      act(l, g, {
        type: "move",
        card: "inexistente",
        to: { type: "column", index: 0 },
      }),
    ).toBe(g);
  });
  it("desfaz uma ação e devolve a jogada, sem devolver recursos", () => {
    const l = levels[0],
      g = createGame(l),
      m = act(l, g, l.solution[0]);
    const h = act(l, m, { type: "hint" }),
      u = act(l, h, { type: "undo" });
    expect(u.board).toEqual(g.board);
    expect(u.undosUsed).toBe(1);
    expect(u.hintsUsed).toBe(h.hintsUsed);
    expect(act(l, g, { type: "undo" })).toBe(g);
  });
  it("revela uma dica legal e limita o recurso a três usos", () => {
    const l = levels[0];
    let g = createGame(l);
    expect(hint(l, g)).toBeTruthy();
    for (let i = 0; i < 3; i++) g = act(l, g, { type: "hint" });
    expect(g.hintsUsed).toBe(3);
    expect(act(l, g, { type: "hint" })).toBe(g);
  });
  it("prioriza vitória na última jogada e impede ações após derrota", () => {
    const l = levels[0];
    let g = createGame(l);
    g.board.moves = l.solution.length;
    for (const a of l.solution) g = act(l, g, a);
    expect(g.board.moves).toBe(0);
    expect(status(l, g)).toBe("won");
    const lost = createGame(l);
    lost.board.moves = 0;
    expect(status(l, lost)).toBe("lost");
    expect(act(l, lost, l.solution[0])).toBe(lost);
  });
});
