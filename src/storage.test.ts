import { it, expect } from "vitest";
import { decode, recordWin, defaultSave } from "./storage";
import { levels } from "./levels";
import { createGame } from "./engine";
it("aceita uma partida íntegra e rejeita dados adulterados ou versões incompatíveis", () => {
  const s = defaultSave();
  s.game = createGame(levels[0]);
  expect(decode(JSON.stringify(s))).toEqual(s);
  expect(decode("{")).toBeNull();
  expect(decode(JSON.stringify({ ...s, version: 42 }))).toBeNull();
  s.game.board.columns[0].push(s.game.board.columns[1][0]);
  expect(decode(JSON.stringify(s))).toBeNull();
  expect(
    decode(JSON.stringify({ ...defaultSave(), stars: { 1: 7 } })),
  ).toBeNull();
});
it("mantém o melhor resultado e desbloqueia apenas a próxima fase", () => {
  const s = recordWin(defaultSave(), 1, 3),
    retry = recordWin(s, 1, 1);
  expect(retry.stars[1]).toBe(3);
  expect(retry.unlocked).toBe(2);
});
