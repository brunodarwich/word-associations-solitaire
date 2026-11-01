import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { levels } from "../src/levels";
import { createGame } from "../src/engine";
import { defaultSave, STORAGE_KEY } from "../src/storage";

test("a campanha inteira pode ser concluída pelos controles da interface", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "As regras e o fluxo móvel também são cobertos pelos testes focados.",
  );
  test.setTimeout(300000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page
    .getByRole("button", { name: "Começar a jogar" })
    .click({ force: true });
  for (const level of levels) {
    await expect(
      page.getByRole("heading", { name: level.title, exact: true }),
    ).toBeVisible();
    for (const a of level.solution) {
      if (a.type === "draw")
        await page
          .getByRole("button", { name: /Comprar carta/ })
          .click({ force: true });
      else if (a.type === "move") {
        await page.locator(`[data-card="${a.card}"]`).click({ force: true });
        await page
          .locator(`[data-foundation="${a.to.index}"]`)
          .click({ force: true });
      }
    }
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("button", {
        name: level.id < 30 ? "Próxima descoberta" : "Revisitar minhas fases",
      })
      .click({ force: true });
  }
  await expect(page.getByText("30 / 30 fases")).toBeVisible();
  await expect(page.getByText("90 / 90 estrelas")).toBeVisible();
});
test("início, campanha e fase avançada mantêm layout e contraste", async ({
  page,
}, info) => {
  await page.goto("./");
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  await audit();
  await page.screenshot({
    path: `screenshots/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "As fases", exact: true }).click();
  await audit();
  const save = defaultSave();
  save.unlocked = 30;
  save.game = createGame(levels[29]);
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: STORAGE_KEY, save },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const overflow = await page
    .locator(".playing-card strong")
    .evaluateAll(
      (elements) =>
        elements.filter(
          (el) =>
            el.scrollHeight > el.clientHeight + 1 ||
            el.scrollWidth > el.clientWidth + 1,
        ).length,
    );
  expect(overflow).toBe(0);
  await audit();
  await page.screenshot({
    path: `screenshots/advanced-${info.project.name}.png`,
    fullPage: true,
  });
});
test("dados inválidos são descartados com aviso e o jogo continua disponível", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => localStorage.setItem(key, '{"version":999}'),
    { key: STORAGE_KEY },
  );
  await page.goto("./");
  await expect(page.getByRole("status")).toContainText("inválido");
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  await expect(
    page.getByRole("heading", { name: levels[0].title }),
  ).toBeVisible();
});
test("títulos longos permanecem inteiros dentro das cartas", async ({
  page,
}) => {
  await page.goto("./");
  const save = defaultSave(),
    level = levels[29];
  save.unlocked = 30;
  save.game = createGame(level);
  save.game.board.columns = level.groups.map((_, group) =>
    level.cards
      .filter((c) => c.group === group)
      .map((c) => c.id)
      .reverse(),
  );
  save.game.board.revealed = save.game.board.columns.map((p) => p.at(-1)!);
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: STORAGE_KEY, save },
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  const outside = await page.locator(".playing-card").evaluateAll(
    (cards) =>
      cards.filter((card) => {
        const box = card.getBoundingClientRect();
        return Array.from(card.querySelectorAll("strong,small")).some(
          (text) => {
            const r = text.getBoundingClientRect();
            return (
              r.top < box.top ||
              r.bottom > box.bottom ||
              r.left < box.left ||
              r.right > box.right
            );
          },
        );
      }).length,
  );
  expect(outside).toBe(0);
});
