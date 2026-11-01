import { test, expect } from "@playwright/test";
import { levels } from "../src/levels";
import { createGame } from "../src/engine";
import { defaultSave, STORAGE_KEY } from "../src/storage";

const level = levels[0],
  ids = level.cards.filter((c) => c.group === 0).map((c) => c.id);
async function prepare(page: import("@playwright/test").Page, tall = false) {
  await page.goto("./");
  const game = createGame(level);
  const others = level.cards.map((c) => c.id).filter((id) => !ids.includes(id));
  game.board.columns = [
    [...(tall ? others : others.slice(0, 1)), ...ids.slice(0, 3)],
    [],
    [],
    [],
  ];
  game.board.stock = level.cards
    .map((c) => c.id)
    .filter((id) => !game.board.columns.flat().includes(id));
  game.board.waste = [];
  game.board.revealed = ids.slice(0, 3);
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: STORAGE_KEY, save: { ...defaultSave(), game } },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
}
async function snapshot(page: import("@playwright/test").Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).game,
    STORAGE_KEY,
  );
}
async function touch(page: import("@playwright/test").Page) {
  const session = await page.context().newCDPSession(page);
  return async (
    type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
    x = 0,
    y = 0,
  ) => {
    await session.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y, id: 1 }],
    });
  };
}

test("teclado move a pilha para outra coluna preservando a ordem", async ({
  page,
}) => {
  await prepare(page);
  const original = await snapshot(page);
  await page.locator(`[data-card="${ids[0]}"]`).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(3);
  await page.getByRole("button", { name: "Coluna vazia 2" }).focus();
  await page.keyboard.press("Enter");
  expect((await snapshot(page)).board.columns[1]).toEqual(ids.slice(0, 3));
  expect((await snapshot(page)).board.moves).toBe(original.board.moves - 1);
  await expect(page.getByRole("status")).toHaveText("3 cartas movidas.");
});

test("toque curto e deslocamento menor que 8px selecionam sem iniciar arraste", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  const original = await snapshot(page),
    send = await touch(page);
  let box = (await page.locator(`[data-card="${ids[0]}"]`).boundingBox())!;
  await send("touchStart", box.x + 20, box.y + 14);
  await send("touchMove", box.x + 23, box.y + 16);
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  await send("touchEnd");
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(3);
  box = (await page.locator(`[data-card="${ids[0]}"]`).boundingBox())!;
  await send("touchStart", box.x + 20, box.y + 14);
  await send("touchEnd");
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(0);
  expect(await snapshot(page)).toEqual(original);
});

test("arraste em espaços livres rola as colunas sem mover cartas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await prepare(page, true);
  const original = await snapshot(page),
    send = await touch(page),
    region = page.locator(".columns-viewport");
  const bounds = (await region.boundingBox())!,
    x = bounds.x + bounds.width / 2;
  await send("touchStart", x, bounds.y + bounds.height - 12);
  for (let i = 1; i <= 6; i++)
    await send("touchMove", x, bounds.y + bounds.height - 12 - i * 14);
  await send("touchEnd");
  await expect
    .poll(() => region.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  expect(await snapshot(page)).toEqual(original);
});

test("toque seleciona pilha, coleta atomicamente e desfaz após recarga", async ({
  page,
}) => {
  await prepare(page);
  const original = await snapshot(page);
  await page
    .locator(`[data-card="${ids[0]}"]`)
    .click({ position: { x: 20, y: 14 } });
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(3);
  await expect(page.getByRole("status")).toContainText("3 cartas selecionadas");
  await page.locator("[data-foundation='0']").click();
  const moved = await snapshot(page);
  expect(moved.board.foundations[0]).toEqual(ids.slice(0, 3));
  expect(moved.board.moves).toBe(original.board.moves - 1);
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  await page.getByRole("button", { name: /Desfazer/ }).click();
  expect((await snapshot(page)).board).toEqual(original.board);
});

test("eventos reais de toque arrastam três cartas sem clique duplicado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  const original = await snapshot(page);
  const send = await touch(page);
  const box = (await page.locator(`[data-card="${ids[0]}"]`).boundingBox())!;
  await send("touchStart", box.x + 20, box.y + 14);
  await send("touchMove", box.x + 36, box.y + 12);
  await expect(page.locator(".drag-preview")).toBeVisible();
  await expect(page.locator(".drag-preview b")).toHaveText("3 cartas");
  const dest = (await page.locator("[data-foundation='0']").boundingBox())!;
  await send("touchMove", dest.x + dest.width / 2, dest.y + dest.height / 2);
  await expect(page.locator("[data-foundation='0']")).toHaveClass(/drag-over/);
  await send("touchEnd");
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(0);
  expect((await snapshot(page)).board.foundations[0]).toEqual(ids.slice(0, 3));
  expect((await snapshot(page)).board.moves).toBe(original.board.moves - 1);
});

test("soltar fora, pointercancel, Escape e abrir modal não gastam jogadas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  const original = await snapshot(page),
    send = await touch(page);
  const start = async () => {
    const box = (await page.locator(`[data-card="${ids[0]}"]`).boundingBox())!;
    await send("touchStart", box.x + 20, box.y + 14);
    await send("touchMove", box.x + 36, box.y + 12);
    await expect(page.locator(".drag-preview")).toBeVisible();
  };
  await start();
  await send("touchMove", 380, 70);
  await send("touchEnd");
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(3);
  expect(await snapshot(page)).toEqual(original);
  await start();
  await send("touchCancel");
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  await start();
  await page.keyboard.press("Escape");
  await send("touchEnd");
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  await expect(page.locator("[aria-pressed=true]")).toHaveCount(0);
  await start();
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".drag-preview")).toHaveCount(0);
  await send("touchCancel");
  await page.keyboard.press("Escape");
  expect(await snapshot(page)).toEqual(original);
});

test("rolagem nas bordas acompanha o arraste dentro das colunas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await prepare(page, true);
  const region = page.locator(".columns-viewport");
  await region.evaluate((el, id) => {
    const card = el.querySelector(`[data-card="${id}"]`)!;
    el.scrollTop +=
      card.getBoundingClientRect().top - el.getBoundingClientRect().top - 12;
  }, ids[0]);
  const before = await region.evaluate((el) => el.scrollTop);
  const box = (await page.locator(`[data-card="${ids[0]}"]`).boundingBox())!,
    send = await touch(page);
  await send("touchStart", box.x + 20, box.y + 14);
  await send("touchMove", box.x + 36, box.y + 12);
  await expect(page.locator(".drag-preview")).toBeVisible();
  const bounds = (await region.boundingBox())!;
  await send(
    "touchMove",
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height - 8,
  );
  await expect
    .poll(() => region.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(before);
  await send("touchCancel");
  await expect(page.locator(".drag-preview")).toHaveCount(0);
});

for (const [width, height] of [
  [320, 640],
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [844, 390],
  [1366, 1024],
  [1440, 1000],
]) {
  test(`essencial visível e toque em ${width}×${height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height });
    await page.goto("./");
    const inView = async (selector: string) => {
      expect(
        await page.locator(selector).evaluate((el) => {
          const b = el.getBoundingClientRect();
          return (
            b.top >= 0 &&
            b.bottom <= innerHeight + 1 &&
            b.left >= 0 &&
            b.right <= innerWidth + 1
          );
        }),
      ).toBe(true);
    };
    await inView(".hero-actions");
    await page.getByRole("button", { name: "Começar a jogar" }).click();
    if (width <= 1050 || info.project.name === "mobile") {
      for (const selector of [".foundations", ".stock-pair", ".board-toolbar"])
        await inView(selector);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1,
        ),
      ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `screenshots/compact-${width}-${height}.png`,
      fullPage: true,
    });
  });
}

test("categorias com títulos longos mantêm ações visíveis na menor tela", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("./");
  const candidate = levels
    .flatMap((level) =>
      level.cards
        .filter((c) => c.kind === "title")
        .map((card) => ({ level, card })),
    )
    .sort((a, b) => b.card.text.length - a.card.text.length)[0];
  const game = createGame(candidate.level);
  const titles = candidate.level.cards
    .filter((c) => c.kind === "title")
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 3);
  titles.forEach((card, index) => {
    game.board.columns = game.board.columns.map((p) =>
      p.filter((id) => id !== card.id),
    );
    game.board.stock = game.board.stock.filter((id) => id !== card.id);
    game.board.foundations[index] = [card.id];
    if (!game.board.revealed.includes(card.id))
      game.board.revealed.push(card.id);
  });
  for (const pile of game.board.columns)
    if (pile.length && !game.board.revealed.includes(pile.at(-1)!))
      game.board.revealed.push(pile.at(-1)!);
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: STORAGE_KEY,
      save: { ...defaultSave(), unlocked: candidate.level.id, game },
    },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  expect(
    await page
      .locator(".board-toolbar")
      .evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight + 1),
  ).toBe(true);
  expect(
    await page.locator(".foundation strong").evaluateAll((elements) =>
      elements.every((el) => {
        const box = el.parentElement!.getBoundingClientRect(),
          text = el.getBoundingClientRect();
        return (
          text.left >= box.left &&
          text.right <= box.right &&
          text.top >= box.top &&
          text.bottom <= box.bottom
        );
      }),
    ),
  ).toBe(true);
});
