import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("hint, pause, landing and reload preserve a real best score", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/");
  await screen.getByRole("button", { name: "Show a hint" }).click();
  await screen.getByRole("button", { name: "Take the line" }).click();
  await screen.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(browser.locator(".result")).toContainText("Your line is paused.");
  await expect(screen.getByRole("button", { name: "Take the line" })).toBeDisabled();
  await screen.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(browser.locator(".result")).toContainText("Lovely line.", { timeout: 15_000 });
  await expect(screen.getByRole("img", { name: "3 of 3 rings collected" })).toBeVisible();
  const best = (await browser.locator(".best").textContent()) ?? "";
  expect(best).toMatch(/^Best: \d+\.\d{2}s$/);
  await app.open("/");
  await expect(browser.locator(".best")).toHaveText(best);
  await expect(
    screen.getByRole("button", { name: "Park 1: First light" }).getByLabel("Completed"),
  ).toBeVisible();
  await screen.getByRole("button", { name: "Show a hint" }).click();
  await screen.getByRole("button", { name: "Undo tweak" }).click();
  await expect(screen.getByRole("slider", { name: "Push strength" })).toHaveValue("12");
  await screen.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(browser.locator(".result")).toContainText("Collect every ring");
});

test("direct final-park landing celebrates only that park", async ({ app, browser, screen }) => {
  await app.open("/");
  await screen.getByRole("button", { name: "Park 5: Last little leap" }).click();
  await screen.getByRole("button", { name: "Show a hint" }).click();
  await screen.getByRole("button", { name: "Take the line" }).click();
  await expect(browser.locator(".complete")).toHaveText("Last little adventure, complete.", {
    timeout: 15_000,
  });
  await expect(screen.getByRole("img", { name: "3 of 3 rings collected" })).toBeVisible();
  await expect(screen.getByRole("button", { name: "Next park" })).toHaveCount(0);
});

test("malformed storage recovers and allows a fresh attempt", async ({ app, browser, screen }) => {
  await app.open("/");
  await browser.evaluate(() => {
    localStorage.setItem("pocket-park.best.v1", "bad");

    return null;
  });
  await app.open("/");
  await expect(browser.locator(".notice")).toContainText("Saved records were unreadable.");
  await expect(browser.locator(".best")).toHaveText("Best: —");
  await screen.getByRole("button", { name: "Dismiss message" }).click();
  await screen.getByRole("button", { name: "Take the line" }).click();
  await screen.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(browser.locator(".result")).toContainText("Collect every ring");
  await expect(screen.getByRole("button", { name: "Take the line" })).toBeEnabled();
});

test("held Space preserves playback until a new press and Escape resets", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/");
  await browser.locator('[role="application"]').focus();
  await browser.keyboard.down("Space");
  await browser.keyboard.down("Space");
  await expect(browser.locator(".result")).toContainText("Let it roll.");
  await browser.keyboard.up("Space");
  await browser.keyboard.down("Space");
  await browser.keyboard.down("Space");
  await expect(browser.locator(".result")).toContainText("Your line is paused.");
  await browser.keyboard.up("Space");
  await screen.getByRole("button", { name: "Resume", exact: true }).focus();
  await browser.keyboard.press("Escape");
  await expect(browser.locator(".result")).toContainText("Collect every ring");
});
