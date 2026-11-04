import { content } from "./content";

// Related themes keep the larger decks coherent without duplicating a word
// or category within the same deal. IDs refer to the original vocabulary.
const relatedLevels = [
  [2, 3, 4, 5],
  [4, 5, 10, 11],
  [6, 12, 21, 24],
  [2, 6, 14, 21],
  [2, 8, 10, 23],
  [4, 14, 21, 3],
  [13, 15, 16, 25, 29],
  [5, 9, 12, 20],
  [12, 19, 20, 27],
  [2, 5, 11, 23],
  [2, 10, 20, 23],
  [3, 9, 21, 24, 27],
  [7, 8, 16, 25, 29],
  [2, 4, 6, 21],
  [7, 22, 25, 29],
  [7, 13, 23, 25, 29],
  [5, 10, 19, 21, 23],
  [7, 15, 23, 25, 27],
  [9, 11, 17, 20, 26],
  [9, 11, 19, 24, 27],
  [3, 4, 6, 12, 14, 24],
  [7, 15, 25, 26, 27, 29],
  [10, 11, 16, 18, 25, 30],
  [3, 9, 12, 20, 21, 27],
  [7, 13, 15, 16, 18, 22, 29],
  [9, 12, 19, 20, 24, 27],
  [7, 15, 18, 22, 25, 26, 29],
  [9, 15, 19, 20, 22, 27],
  [7, 13, 15, 16, 18, 25, 27],
  [7, 13, 15, 16, 23, 25, 29],
];

export const groupCounts = [5, 7, 8, 9, 10, 12];
export const columnDepths = [4, 6, 7, 8, 9, 10];

export function expandGroups(index: number, shuffle: <T>(items: T[]) => T[]) {
  const groups = content[index].groups.slice();
  const target = groupCounts[Math.floor(index / 5)];
  const normalize = (word: string) =>
    word.normalize("NFC").toLocaleLowerCase("pt-BR");
  const usedWords = new Set(
    groups.flatMap(([, words]) => words.map(normalize)),
  );
  const usedNames = new Set(groups.map(([name]) => normalize(name)));
  const candidates = shuffle(
    relatedLevels[index].flatMap((id) => content[id - 1].groups),
  );
  for (const [name, words] of candidates) {
    if (groups.length === target) break;
    if (
      usedNames.has(normalize(name)) ||
      words.some((word) => usedWords.has(normalize(word)))
    )
      continue;
    groups.push([name, words]);
    usedNames.add(normalize(name));
    words.forEach((word) => usedWords.add(normalize(word)));
  }
  if (groups.length !== target)
    throw new Error(`Vocabulário insuficiente na fase ${index + 1}`);
  return groups;
}
