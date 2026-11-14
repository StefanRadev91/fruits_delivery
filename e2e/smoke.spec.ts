import { expect, test } from "@playwright/test";

test("home page shows the business hero with catalog and login actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-title")).toBeVisible();
  await expect(page.getByTestId("cta-catalog")).toBeVisible();
  await expect(page.getByTestId("cta-login")).toBeVisible();
});
