import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

test("profile page has no automated axe violations", async ({ page }) => {
  await page.goto("/us/en/users/settings/profile");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("legal-name flow disclosure has no automated axe violations", async ({ page }) => {
  await page.goto("/us/en/users/settings/profile");
  await page.getByRole("button", { name: "Request change" }).click();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
