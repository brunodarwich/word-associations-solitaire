import { test, expect } from "@playwright/test";

for (const width of [320, 768, 1024, 1440]) {
  test(`navegação e seleção sem transbordamento em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    const fits = async () =>
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    await fits();
    for (const button of await page.locator(".site-header nav button").all()) {
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "Começar a jogar" }).click();
    await fits();
    await page.locator("button[data-card]").first().click();
    await expect(page.locator("[aria-pressed=true]")).toHaveCount(1);
    await page.getByRole("button", { name: "Cancelar seleção" }).click();
    await expect(page.locator("[aria-pressed=true]")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Toque em uma carta");
    if (width <= 1050) {
      const tutorial = page.getByText("Como jogar esta fase", { exact: true });
      if (await tutorial.isVisible()) {
        await tutorial.click();
        await expect(page.locator(".mobile-tutorial p")).toBeVisible();
      } else {
        await page
          .getByRole("button", { name: "Como jogar", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
      }
    }
    await page.getByRole("button", { name: "Todas as fases" }).click();
    await fits();
    await expect(
      page.getByRole("progressbar", { name: "Progresso nas 30 fases" }),
    ).toHaveAttribute("value", "0");
    expect(
      await page
        .locator("main")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  });
}
