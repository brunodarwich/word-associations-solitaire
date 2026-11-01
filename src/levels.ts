import { content } from "./content";
import type { Level, Card, PlayAction } from "./types";

// A fixed PRNG makes every deal reproducible across devices and restarts.
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
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
  const pending = data.groups.map((_, g) => g),
    active: number[] = [],
    progress = new Map<number, number>();
  const order: Card[] = [];
  while (pending.length || active.length) {
    if (
      pending.length &&
      active.length < 3 &&
      (!active.length || rng() < 0.48)
    ) {
      const group = pending.shift()!;
      active.push(group);
      progress.set(group, 0);
      order.push(cards[group * 5]);
    } else {
      const index = Math.floor(rng() * active.length),
        group = active[index],
        n = progress.get(group)! + 1;
      order.push(cards[group * 5 + n]);
      progress.set(group, n);
      if (n === 4) active.splice(index, 1);
    }
  }
  // Distribute the legal order among column tops and stock, preserving each source's order.
  const capacities = Array(count).fill(depth) as number[];
  capacities.push(cards.length - count * depth);
  const streams: string[][] = capacities.map(() => []),
    sources: number[] = [];
  order.forEach((card) => {
    const available = capacities
      .map((n, j) => (n > 0 ? j : -1))
      .filter((j) => j >= 0);
    const source = available[Math.floor(rng() * available.length)];
    capacities[source]--;
    streams[source].push(card.id);
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
