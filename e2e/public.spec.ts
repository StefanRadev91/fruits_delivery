import { expect, test } from "@playwright/test";

// Uses seeded demo data (pnpm db:seed).

const b2cEnabled = process.env.NEXT_PUBLIC_B2C_ENABLED === "true";

test("home page leads to the catalog, login and contact", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("cta-catalog").click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByTestId("product-grid")).toBeVisible();
  await page.goto("/");
  await page.getByTestId("cta-login").click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/");
  await page.getByTestId("cta-contact").click();
  await expect(page.getByTestId("contact-page")).toBeVisible();
});

test("home page shows categories that open the filtered catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-category")).toHaveCount(5);
  await page.getByTestId("home-category").first().click();
  await expect(page).toHaveURL(/category=/);
});

test("all public pages open and have a title", async ({ page }) => {
  const pages: [string, string][] = [
    ["/business", "business-page"], ["/brand", "brand-page"], ["/zones", "zones-page"], ["/about", "about-page"],
    ["/contact", "contact-page"], ["/terms", "terms-page"], ["/privacy", "privacy-page"],
  ];
  for (const [path, testId] of pages) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.getByTestId(testId)).toBeVisible();
    await expect(page.locator("h1")).not.toBeEmpty();
  }
});

test("navigation links work", async ({ page }) => {
  await page.goto("/");
  for (const [id, url] of [["nav-catalog", /\/catalog/], ["nav-business", /\/business/], ["nav-zones", /\/zones/], ["nav-about", /\/about/], ["nav-contact", /\/contact/]] as const) {
    await page.getByTestId(id).click();
    await expect(page).toHaveURL(url);
  }
});

test("catalog search and category filter", async ({ page }) => {
  await page.goto("/catalog");
  const total = await page.getByTestId("product-card").count();
  expect(total).toBeGreaterThan(20);

  await page.getByTestId("catalog-search").fill("домати");
  await page.getByTestId("catalog-search-submit").click();
  await expect(page).toHaveURL(/q=/);
  const names = await page.getByTestId("product-card").locator("h3").allTextContents();
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((n) => n.toLowerCase().includes("домати"))).toBe(true);

  await page.getByTestId("catalog-search").fill("несъществуващ");
  await page.getByTestId("catalog-search-submit").click();
  await expect(page.getByTestId("catalog-empty")).toBeVisible();

  await page.goto("/catalog");
  await page.getByTestId("category-turshiya").click();
  await expect(page.getByTestId("product-card")).toHaveCount(3);
});

test("anonymous visitors see products and photos but no prices", async ({ page }) => {
  test.skip(b2cEnabled, "household prices are public when B2C is on");
  await page.goto("/catalog/yabalka-zelena");
  await expect(page.getByTestId("product-name")).toHaveText("Ябълка зелена");
  await expect(page.getByTestId("product-price")).toHaveCount(0);
  await expect(page.getByTestId("product-client-hint")).toBeVisible();
  const img = page.locator('main img[alt="Ябълка зелена"]');
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const ld = JSON.parse((await page.getByTestId("product-jsonld").textContent())!);
  expect(ld["@type"]).toBe("Product");
  expect(ld.offers).toBeUndefined();
  expect(ld.image[0]).toContain("/products/");
});

test("catalog cards show a photo for each product and no prices", async ({ page }) => {
  test.skip(b2cEnabled, "household prices are public when B2C is on");
  await page.goto("/catalog");
  const cards = page.getByTestId("product-card");
  expect(await cards.count()).toBeGreaterThan(100);
  await expect(page.getByTestId("product-price")).toHaveCount(0);
  await expect(page.getByTestId("catalog-price-hint")).toBeVisible();
  expect(await page.locator('[data-testid="product-card"] img').count()).toBeGreaterThan(100);
});

test("household prices include VAT when B2C is on", async ({ page }) => {
  test.skip(!b2cEnabled, "B2C is off");
  await page.goto("/catalog/yabalka-zelena");
  await expect(page.getByTestId("product-price")).toContainText("1,79 €");
  const ld = JSON.parse((await page.getByTestId("product-jsonld").textContent())!);
  expect(ld.offers.price).toBe("1.79");
});

test("household registration is closed while B2C is off", async ({ page }) => {
  test.skip(b2cEnabled, "B2C is on");
  expect((await page.goto("/register"))?.status()).toBe(404);
  await page.goto("/login");
  await expect(page.getByTestId("to-register")).toHaveCount(0);
  await expect(page.getByTestId("to-contact")).toBeVisible();
});

test("unknown product returns 404", async ({ page }) => {
  const res = await page.goto("/catalog/nqma-takuv-produkt");
  expect(res?.status()).toBe(404);
});

test("company members see net prices with their price list", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("owner@roza.example");
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/account/);
  await page.goto("/catalog/yabalka-zelena");
  // our base 1.49 net, restaurant price list -8% = 1.37, shown without VAT
  await expect(page.getByTestId("product-price")).toContainText("1,37 €");
  await expect(page.getByTestId("product-price")).toContainText("без ДДС");
});

test("zones page lists delivery zones with terms", async ({ page }) => {
  await page.goto("/zones");
  await expect(page.getByTestId("zone-card")).toHaveCount(3);
  await expect(page.getByTestId("zones-page")).toContainText("София – център");
  await expect(page.getByTestId("zones-page")).toContainText("22:00");
  if (!b2cEnabled) await expect(page.getByTestId("zones-page")).not.toContainText("За дома");
});

test("cookie banner is shown once and remembered", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("cookie-banner")).toBeVisible();
  await page.getByTestId("cookie-accept").click();
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("/catalog/yabalka-zelena");
  expect(xml).toContain("/business");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});

test("main pages render without browser errors (e.g. hydration)", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of ["/", "/catalog", "/catalog/yabalka-zelena", "/business", "/zones", "/login", "/brand"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
});
