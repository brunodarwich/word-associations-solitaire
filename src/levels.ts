import { content } from "./content";
import type { Level, Card, PlayAction } from "./types";

// A fixed PRNG makes every deal reproducible across devices and restarts.
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const levels: Level[] = content.map((data, i) => {
  const id = i + 1,
    rng = random(id * 7919),
    count = id <= 5 ? 4 : id <= 15 ? 5 : id <= 20 ? 4 : 5;
  const depth = id <= 10 ? 2 : id <= 15 ? 3 : id <= 25 ? 4 : 5;
  const cards: Card[] = data.groups.flatMap(([name, words], group) => [
    { id: `${id}-${group}-0`, group, kind: "title" as const, text: name },
    ...words.map((text, j) => ({
      id: `${id}-${group}-${j + 1}`,
      group,
      kind: "word" as const,
      text,
    })),
  ]);
  // Construct a legal collection order with at most three simultaneously open groups.
  const pending = shuffle(
      data.groups.map((_, g) => g),
      rng,
    ),
    active: number[] = [],
    progress = new Map<number, number>();
  const words = data.groups.map((_, group) =>
    shuffle(
      cards.filter((c) => c.group === group && c.kind === "word"),
      rng,
    ),
  );
  const order: Card[] = [];
  while (pending.length || active.length) {
    if (
      pending.length &&
      active.length < 3 &&
      (!active.length || rng() < (id <= 5 ? 0.48 : 0.72))
    ) {
      const group = pending.shift()!;
      active.push(group);
      progress.set(group, 0);
      order.push(cards[group * 5]);
    } else {
      const alternatives = active.filter((g) => g !== order.at(-1)?.group);
      const candidates = alternatives.length ? alternatives : active;
      const group = candidates[Math.floor(rng() * candidates.length)],
        index = active.indexOf(group),
        n = progress.get(group)! + 1;
      order.push(words[group][n - 1]);
      progress.set(group, n);
      if (n === 4) active.splice(index, 1);
    }
  }
  // Distribute the legal order among column tops and stock, preserving each source's order.
  const capacities = Array(count).fill(depth) as number[];
  capacities.push(cards.length - count * depth);
  const streams: string[][] = capacities.map(() => []),
    sources: number[] = [];
  const lastGroups = capacities.map(() => -1);
  order.forEach((card) => {
    const available = capacities
      .map((n, j) => (n > 0 ? j : -1))
      .filter((j) => j >= 0);
    // Prefer a different category from the previous card in each source.
    // Weight by remaining space so the stock is not left as one ordered tail.
    const mixed = available.filter((j) => lastGroups[j] !== card.group);
    const candidates = mixed.length ? mixed : available;
    let ticket = rng() * candidates.reduce((sum, j) => sum + capacities[j], 0);
    const source = candidates.find((j) => (ticket -= capacities[j]) < 0)!;
    capacities[source]--;
    streams[source].push(card.id);
    lastGroups[source] = card.group;
    sources.push(source);
  });
  const solution: PlayAction[] = [],
    slots: (number | null)[] = [null, null, null],
    filled = new Map<number, number>();
  order.forEach((card, j) => {
    if (sources[j] === count) solution.push({ type: "draw" });
    let slot = slots.indexOf(card.group);
    if (card.kind === "title") {
      slot = slots.indexOf(null);
      slots[slot] = card.group;
      filled.set(card.group, 0);
    }
    solution.push({
      type: "move",
      card: card.id,
      to: { type: "foundation", index: slot },
    });
    if (card.kind === "word") {
      const n = filled.get(card.group)! + 1;
      filled.set(card.group, n);
      if (n === 4) slots[slot] = null;
    }
  });
  const factor = [1.6, 1.45, 1.35, 1.25, 1.2, 1.15][Math.floor(i / 5)],
    limit = Math.ceil(solution.length * factor);
  const columns = streams.slice(0, count).map((s) => s.slice().reverse());
  return {
    id,
    title: data.title,
    groups: data.groups.map((g) => g[0]),
    cards,
    solution,
    limit,
    initial: {
      columns,
      stock: streams[count].slice().reverse(),
      waste: [],
      foundations: [[], [], []],
      completed: [],
      revealed: columns.map((c) => c.at(-1)!),
      moves: limit,
    },
  };
});
