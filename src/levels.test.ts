import { describe, expect, it } from "vitest";
import { levels } from "./levels";

describe("embaralhamento da campanha", () => {
  it("aumenta cartas, grupos e profundidade ao longo dos capítulos", () => {
    const groups = [5, 7, 8, 9, 10, 12];
    const depths = [4, 6, 7, 8, 9, 10];
    for (const level of levels) {
      const chapter = Math.floor((level.id - 1) / 5);
      expect(level.groups).toHaveLength(groups[chapter]);
      expect(level.cards).toHaveLength(groups[chapter] * 5);
      expect(
        level.initial.columns.every((p) => p.length === depths[chapter]),
      ).toBe(true);
      expect(level.initial.revealed).toHaveLength(level.initial.columns.length);
      expect(level.initial.stock.length).toBeGreaterThanOrEqual(5);
    }
    expect(levels[6].cards).toHaveLength(35);
    expect(levels[6].groups).toHaveLength(7);
    expect(levels[6].initial.columns.map((p) => p.length)).toEqual([
      6, 6, 6, 6, 6,
    ]);
  });

  it("varia a ordem das categorias e das palavras, sem seguir o cadastro", () => {
    let reorderedGroups = 0;
    let reorderedWords = 0;
    let totalGroups = 0;
    for (const level of levels) {
      const moves = level.solution.filter((a) => a.type === "move");
      const order = moves.map((a) => level.cards.find((c) => c.id === a.card)!);
      const titles = order.filter((c) => c.kind === "title");
      if (titles.some((c, i) => c.group !== i)) reorderedGroups++;
      for (let group = 0; group < level.groups.length; group++) {
        totalGroups++;
        const words = order.filter(
          (c) => c.group === group && c.kind === "word",
        );
        const original = level.cards.filter(
          (c) => c.group === group && c.kind === "word",
        );
        if (words.some((c, i) => c.id !== original[i].id)) reorderedWords++;
      }
    }
    expect(reorderedGroups).toBeGreaterThanOrEqual(24);
    expect(reorderedWords / totalGroups).toBeGreaterThan(0.85);
  });

  it("mistura as categorias em pelo menos 75% das cartas vizinhas das colunas avançadas", () => {
    let neighbors = 0;
    let mixed = 0;
    for (const level of levels.slice(10)) {
      for (const column of level.initial.columns) {
        for (let i = 1; i < column.length; i++) {
          neighbors++;
          const group = (id: string) =>
            level.cards.find((c) => c.id === id)!.group;
          if (group(column[i]) !== group(column[i - 1])) mixed++;
        }
      }
    }
    expect(mixed / neighbors).toBeGreaterThanOrEqual(0.75);
  });
});
