import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { levels } from "../src/levels";
test("joga, vence, desbloqueia e mantém o progresso após recarregar", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  await expect(
    page.getByRole("heading", { name: levels[0].title }),
  ).toBeVisible();
  for (const a of levels[0].solution) {
    if (a.type === "draw")
      await page.getByRole("button", { name: /Comprar carta/ }).click();
    else if (a.type === "recycle")
      await page.getByRole("button", { name: "Reciclar descarte" }).click();
    else {
      await page.locator(`[data-card="${a.card}"]`).click();
      await page.locator(`[data-foundation="${a.to.index}"]`).click();
    }
  }
  await expect(
    page.getByRole("heading", { name: "Tudo encontrou seu lugar." }),
  ).toBeVisible();
  await expect(page.getByLabel("3 de 3 estrelas")).toBeVisible();
  await page.getByRole("button", { name: "Próxima descoberta" }).click();
  await expect(
    page.getByRole("heading", { name: levels[1].title }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  await expect(
    page.getByRole("heading", { name: levels[1].title }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Todas as fases" }).click();
  await expect(
    page.getByRole("button", { name: /02 Casa organizada/ }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: /Entre bichos e plantas/ }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
test("layout, teclado, dicas, desfazer e configurações acessíveis", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  const initial = await page.locator(".move-counter strong").innerText();
  const a = levels[0].solution[0];
  if (a.type === "draw") {
    await page.getByRole("button", { name: /Comprar carta/ }).focus();
    await page.keyboard.press("Enter");
  } else if (a.type === "move") {
    await page.locator(`[data-card="${a.card}"]`).focus();
    await page.keyboard.press("Enter");
    await page.locator(`[data-foundation="${a.to.index}"]`).focus();
    await page.keyboard.press("Enter");
  }
  await page.getByRole("button", { name: /Desfazer/ }).click();
  await expect(page.locator(".move-counter strong")).toHaveText(initial);
  await page.getByRole("button", { name: /Dica/ }).click();
  await expect(page.getByRole("status")).toContainText("Dica:");
  await expect(page.locator(".hinted").first()).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continuar partida" }).click();
  await expect(
    page.getByRole("button", { name: "Dica 2", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Desfazer 2", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({
    path: `screenshots/game-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Configurações" }).click();
  await page.getByLabel("Reduzir movimentos").check();
  await page.getByRole("button", { name: "Apagar meu progresso" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByLabel("Reduzir movimentos")).toBeChecked();
  await page.getByRole("button", { name: "Apagar meu progresso" }).click();
  await page
    .getByRole("button", { name: "Apagar progresso", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Começar a jogar" }),
  ).toBeVisible();
});
test("arraste equivale a selecionar e mover", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  const l = levels[0];
  for (const a of l.solution) {
    if (a.type === "draw") {
      await page.getByRole("button", { name: /Comprar carta/ }).click();
      continue;
    }
    if (a.type !== "move") continue;
    await page
      .locator(`[data-card="${a.card}"]`)
      .dragTo(page.locator(`[data-foundation="${a.to.index}"]`));
    await expect(page.locator(`[data-card="${a.card}"]`)).toHaveCount(0);
    break;
  }
});
