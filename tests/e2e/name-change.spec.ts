import { expect, test } from "@playwright/test";

const profilePath = "/us/en/users/settings/profile";

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

async function chooseScenario(page: import("@playwright/test").Page, value: string) {
  await page.goto(profilePath);
  await page.getByLabel("Choose a team-review scenario").selectOption(value);
}

async function startLegalFlow(
  page: import("@playwright/test").Page,
  totalSteps = 6,
  nextStep = "Documents"
) {
  await page.getByRole("button", { name: "Request change" }).click();
  await expect(page.getByText(`Step 1 of ${totalSteps}: Preview`)).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(`Step 2 of ${totalSteps}: Account check`)).toBeVisible();
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(page.getByText(`Step 3 of ${totalSteps}: ${nextStep}`)).toBeVisible();
}

async function completeDocumentFlow(page: import("@playwright/test").Page, includeProof = true) {
  await page.getByRole("button", { name: "Use sample photo ID" }).click();
  if (includeProof) {
    await page.getByRole("button", { name: "Use sample name-change document" }).click();
  }
  await page.getByRole("button", { name: "Continue to selfie check" }).click();
  await page.getByRole("button", { name: "Capture sample selfie" }).click();
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByRole("button", { name: "Submit for review" }).click();
}

test("S1 legal-name update auto-approves complete documents", async ({ page }) => {
  await chooseScenario(page, "happy-path");
  await startLegalFlow(page);
  await completeDocumentFlow(page);

  await expect(page.getByRole("heading", { name: "Legal name change approved" })).toBeVisible();
  await expect(page.getByText("Step 6 of 6: Result")).toBeVisible();
  await expect(page.locator(".status-pill").getByText("Approved", { exact: true })).toBeVisible();
  await expect(page.getByText("previous name stays in the case history", { exact: false })).toBeVisible();
  await expect(page.getByText("Check the name on your saved card")).toBeVisible();
});

test("S2 missing proof requests more information", async ({ page }) => {
  await chooseScenario(page, "needs-more-documents");
  await startLegalFlow(page);
  await completeDocumentFlow(page, false);

  await expect(page.getByRole("heading", { name: "One more document needed" })).toBeVisible();
  await expect(page.locator(".status-pill").getByText("More information needed", { exact: true })).toBeVisible();
});

test("S5 preferred-name update leaves legal name unchanged", async ({ page }) => {
  await chooseScenario(page, "preferred-only");
  await page.getByRole("button", { name: "Edit preferred name" }).click();
  await page.getByRole("textbox", { name: "Preferred name" }).fill("Sam");
  await page.getByRole("button", { name: "Save preferred name" }).click();

  await expect(page.getByText("Legal name unchanged.")).toBeVisible();
  await expect(page.getByText("Alex Rivera (unchanged)")).toBeVisible();
});

test("S3 similar name from routine safety check routes to specialist review", async ({ page }) => {
  await chooseScenario(page, "specialist-review");
  await startLegalFlow(page);
  await completeDocumentFlow(page);

  await expect(page.getByRole("heading", { name: "Specialist review needed" })).toBeVisible();
  await expect(page.getByText("This does not mean the match is you", { exact: false })).toBeVisible();
  await expect(page.locator(".status-pill").getByText("Specialist review", { exact: true })).toBeVisible();
});

test("S4 account protection issue pauses the request and offers review", async ({ page }) => {
  await chooseScenario(page, "account-protection");
  await page.getByRole("button", { name: "Request change" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Verify and continue" }).click();

  await expect(page.getByRole("heading", { name: "Request paused for account protection" })).toBeVisible();
  await expect(page.locator(".status-pill").getByText("Blocked", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Request support review" }).click();
  await expect(page.getByText("Support review requested")).toBeVisible();
});

test("S6 unclear two-written-form name routes to specialist review", async ({ page }) => {
  await chooseScenario(page, "name-spelling-review");
  await startLegalFlow(page);
  await expect(page.getByText("a passport can resolve this", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Use sample photo ID" }).click();
  await page.getByRole("button", { name: "Use sample name-change document" }).click();
  await page.getByRole("button", { name: "Continue to selfie check" }).click();
  await page.getByRole("button", { name: "Capture sample selfie" }).click();
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.getByLabel("Name in original writing system")).toBeVisible();
  await page.getByRole("button", { name: "Submit for review" }).click();

  await expect(page.getByRole("heading", { name: "Specialist review needed" })).toBeVisible();
});
