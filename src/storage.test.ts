import { it, expect } from "vitest";
import { decode, recordWin, defaultSave } from "./storage";
import { levels, legacyLevels } from "./levels";
import { createGame, act } from "./engine";
import legacySave from "./legacy-save.fixture.json";
it("migra a fase 7 antiga para a mesa ampliada preservando a campanha e preferências", () => {
  const save = decode(JSON.stringify(legacySave));
  expect(save?.version).toBe(2);
  expect(save?.unlocked).toBe(7);
  expect(save?.stars).toEqual(legacySave.stars);
  expect(save?.prefs).toEqual(legacySave.prefs);
  expect(save?.game).toEqual(createGame(levels[6]));
  expect(save?.game?.board.columns[0]).toHaveLength(6);
});
it("valida a mesa antiga antes de migrar e aceita campanhas antigas sem partida", () => {
  const invalid = structuredClone(legacySave);
  invalid.game.board.stock.pop();
  expect(decode(JSON.stringify(invalid))).toBeNull();
  expect(decode(JSON.stringify({ ...legacySave, game: null }))).toEqual({
    ...legacySave,
    version: 2,
    game: null,
  });
});
it("migra mesas e históricos das 30 fases e não reinicia novamente um save atualizado", () => {
  for (const level of legacyLevels) {
    const game = act(level, createGame(level), level.solution[0]);
    const save = decode(
      JSON.stringify({
        ...defaultSave(),
        version: 1,
        unlocked: level.id,
        game,
      }),
    );
    expect(save?.game).toEqual(createGame(levels[level.id - 1]));
    save!.game = act(
      levels[level.id - 1],
      save!.game!,
      levels[level.id - 1].solution[0],
    );
    expect(decode(JSON.stringify(save))).toEqual(save);
  }
});
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
