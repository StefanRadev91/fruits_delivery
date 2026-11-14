import { expect, test, type Page } from "@playwright/test";

// Uses the seeded demo users (pnpm db:seed). Password: demo1234
async function login(page: Page, email: string, password = "demo1234") {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
}

/** Login and wait until the session cookie is set (redirect to /account). */
async function loginOk(page: Page, email: string) {
  await login(page, email);
  await expect(page).toHaveURL(/\/account/);
}

test("anonymous users are redirected from protected pages to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
});

test("wrong password shows an error", async ({ page }) => {
  await login(page, "admin@fruits.local", "wrong-password");
  await expect(page.getByTestId("login-error")).toBeVisible();
});

test("admin can open the admin panel and log out", async ({ page }) => {
  await loginOk(page, "admin@fruits.local");
  await page.goto("/admin");
  await expect(page.getByTestId("admin-title")).toBeVisible();
  await page.getByTestId("logout").click();
  await expect(page).toHaveURL("/");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("a customer cannot open the admin panel", async ({ page }) => {
  await loginOk(page, "ivana@example.bg");
  await page.goto("/admin");
  await expect(page.getByTestId("forbidden")).toBeVisible();
});

test("login redirects back to the requested page", async ({ page }) => {
  await page.goto("/admin");
  await page.getByTestId("login-email").fill("staff@fruits.local");
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("admin-title")).toBeVisible();
});

test("registration creates an account and signs in; duplicates are rejected", async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_B2C_ENABLED !== "true", "household registration is off");
  const email = `test-${Date.now()}@example.bg`;
  await page.goto("/register");
  await page.getByTestId("register-name").fill("Тест Потребител");
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-password").fill("password123");
  await page.getByTestId("register-submit").click();
  await expect(page.getByTestId("account-email")).toHaveText(email);

  await page.getByTestId("logout").click();
  await expect(page).toHaveURL("/");
  await page.goto("/register");
  await page.getByTestId("register-name").fill("Тест Потребител");
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-password").fill("password123");
  await page.getByTestId("register-submit").click();
  await expect(page.getByTestId("register-error")).toBeVisible();
});

test("registration validates the password", async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_B2C_ENABLED !== "true", "household registration is off");
  await page.goto("/register");
  await page.getByTestId("register-name").fill("Ана");
  await page.getByTestId("register-email").fill("ana@example.bg");
  await page.getByTestId("register-password").fill("123");
  await page.getByTestId("register-submit").click();
  await expect(page.getByTestId("register-password-error")).toBeVisible();
});
