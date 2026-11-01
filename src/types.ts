export type Card = {
  id: string;
  group: number;
  kind: "title" | "word";
  text: string;
};
export type Destination = { type: "column" | "foundation"; index: number };
export type PlayAction =
  | { type: "move"; card: string; to: Destination }
  | { type: "moveStack"; card: string; to: Destination }
  | { type: "draw" }
  | { type: "recycle" };
export type Action = PlayAction | { type: "hint" } | { type: "undo" };
export type Board = {
  columns: string[][];
  stock: string[];
  waste: string[];
  foundations: string[][];
  completed: number[];
  revealed: string[];
  moves: number;
};
export type Game = {
  levelId: number;
  board: Board;
  history: Board[];
  hintsUsed: number;
  undosUsed: number;
};
export type Level = {
  id: number;
  title: string;
  groups: string[];
  cards: Card[];
  initial: Board;
  solution: PlayAction[];
  limit: number;
};
