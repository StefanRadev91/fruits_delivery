/**
 * Downloads EXAMPLE product photos from Wikipedia/Wikimedia Commons (freely licensed)
 * into public/products and writes prisma/data/photos.json with author + license per file.
 * Replace them with your own photos before launch; CC BY / CC BY-SA images require attribution.
 *
 * Run: pnpm photos
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { priceList } from "../prisma/data/price-list";
import { slugify } from "../src/lib/slug";

/** Bulgarian product name -> English Wikipedia article titles to try (first with a free image wins). */
const titles: Record<string, string> = {
  "Авокадо Тропс": "Hass avocado|Avocado", "Авокадо зелено": "Avocado", "Банани": "Banana", "Ананас": "Pineapple",
  "Боровинка": "Blueberry", "Грейпфрут фреш": "Grapefruit", "Грозде без семки": "Grape", "Круша": "Pear",
  "Киви": "Kiwifruit", "Лайм": "Lime (fruit)", "Лимони": "Lemon", "Малина (125 г)": "Raspberry", "Нар": "Pomegranate",
  "Портокал десертен": "Orange (fruit)", "Портокал фреш": "Orange (fruit)", "Ябълка зелена": "Granny Smith",
  "Ябълка златна": "Golden Delicious", "Ябълка червена": "Red Delicious", "Ягоди": "Strawberry",
  "Аспержи (250 г)": "Asparagus|Asparagus officinalis|White asparagus", "Батат": "Sweet potato", "Литъл джем": "Little Gem lettuce|Lettuce", "Броколи": "Broccoli",
  "Броколини (200 г)": "Broccolini", "Белен чесън": "Garlic", "Гъба печурка": "Agaricus bisporus",
  "Гъба кладница": "Oyster mushroom", "Гъба кралска печурка": "Portobello mushroom|Agaricus bisporus",
  "Гъба ветрогон (400 г)": "Pleurotus eryngii", "Гъба шимеджи": "Shimeji|Hypsizygus tessellatus",
  "Бейби спанак (100 г)": "Spinach", "Бейби рукола (100 г)": "Eruca vesicaria|Arugula", "Дайкон": "Daikon",
  "Домат розов": "Tomato", "Домат жълт/оранжев": "Tomato", "Домати кампари": "Cherry tomato",
  "Коприва (100 г)": "Urtica dioica", "Египетски грах": "Chickpea", "Египетски боб": "Vicia faba",
  "Зеле": "Cabbage", "Зеле червено": "Red cabbage", "Картоф стар": "Potato", "Картоф френски": "Potato",
  "Холандски картоф за пържене": "Potato", "Картоф лилав/шарен": "Purple potato|Potato", "Калифорния жълта": "Bell pepper",
  "Краставица": "Cucumber", "Карфиол": "Cauliflower", "Карфиол цветен жълт/лилав/зелен": "Cauliflower",
  "Картоф бейби": "Potato", "Кейл": "Kale", "Лук кромид": "Onion", "Лук червен": "Red onion|Onion",
  "Лук пресен": "Scallion", "Люта чушка": "Chili pepper", "Халапеньо": "Jalapeño", "Морков": "Carrot",
  "Патладжан": "Eggplant", "Падрони": "Padrón pepper", "Пащърнак": "Parsnip", "Пак чой": "Bok choy",
  "Радичо": "Radicchio", "Романеско": "Romanesco broccoli", "Айсберг": "Iceberg lettuce", "Салата зелена": "Lettuce",
  "Салата червена": "Lettuce", "Салата романа (пакет 2 бр.)": "Romaine lettuce|Lettuce", "Селъри": "Celery",
  "Спанак (500 г)": "Spinach", "Тиквички": "Zucchini", "Тиквички шарени": "Zucchini", "Целина": "Celeriac",
  "Чери домати": "Cherry tomato", "Цвекло варено (плик 500 г)": "Beetroot", "Цвекло червено": "Beetroot",
  "Чесън стар": "Garlic", "Чушка зелена": "Bell pepper", "Чушка коктейлна": "Bell pepper",
  "Чушка Калифорния": "Bell pepper", "Чушка червена": "Bell pepper", "Цветен морков / черен": "Carrot",
  "Бейби морков": "Carrot",
  "Царска туршия": "Pickling", "Мешана туршия": "Giardiniera|Pickling", "Кисело зеле": "Sauerkraut|Pickled cabbage|Cabbage",
  "Лешник бял суров": "Hazelnut", "Лешник печен": "Hazelnut", "Орех екстра": "Walnut", "Бадем печен": "Almond",
  "Бадем суров": "Almond", "Бирен фъстък": "Peanut", "Бразилски орех": "Brazil nut", "Кашу печено": "Cashew",
  "Кашу сурово": "Cashew", "Кедрови ядки (500 г)": "Pine nut", "Кайсия сушена": "Dried apricot|Apricot",
  "Сусам бял (500 г)": "Sesame", "Сусам черен (500 г)": "Sesame", "Шам фъстък бял суров": "Pistachio",
  "Магданоз": "Parsley", "Босилек": "Basil", "Валериана (100 г)": "Valerianella locusta|Corn salad",
  "Джинджифил": "Ginger", "Див лук": "Allium ursinum", "Естрагон": "Tarragon", "Копър": "Dill",
  "Спанак пакет": "Spinach", "Мента": "Mint|Mentha|Peppermint|Spearmint", "Микро грийн (микс)": "Microgreen", "Розмарин": "Rosemary",
  "Червен пипер": "Paprika", "Черен пипер мляни": "Black pepper|Piper nigrum|Peppercorn", "Черен пипер на зърна": "Black pepper|Piper nigrum|Peppercorn",
  "Чубрица ситна": "Satureja hortensis|Summer savory", "Джоджен (1 кг)": "Spearmint",
};

// Generic client name (Wikimedia asks automated clients to identify themselves).
const UA = "FruitsDeliveryExamplePhotos/1.0 (local development script)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api(base: string, params: Record<string, string>) {
  const url = `${base}/w/api.php?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

type Page = { title: string; pageimage?: string; thumbnail?: { source: string } };

/** title (as asked) -> page with lead image */
async function leadImages(all: string[]): Promise<Map<string, Page>> {
  const out = new Map<string, Page>();
  for (let i = 0; i < all.length; i += 40) {
    const chunk = all.slice(i, i + 40);
    const data = await api("https://en.wikipedia.org", {
      action: "query", prop: "pageimages", piprop: "thumbnail|name", pithumbsize: "500",
      redirects: "1", titles: chunk.join("|"),
    });
    const redirect = new Map<string, string>();
    for (const r of [...(data.query.normalized ?? []), ...(data.query.redirects ?? [])]) redirect.set(r.from, r.to);
    const byTitle = new Map<string, Page>(Object.values<Page>(data.query.pages).map((p) => [p.title, p]));
    for (const t of chunk) {
      let cur = t;
      for (let k = 0; k < 3 && redirect.has(cur); k++) cur = redirect.get(cur)!;
      const page = byTitle.get(cur);
      if (page) out.set(t, page);
    }
    await sleep(300);
  }
  return out;
}

const strip = (html?: string) => (html ?? "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();

/** file name -> license info, only for files that live on Commons (i.e. are freely licensed). */
async function licenses(files: string[]) {
  const out = new Map<string, { license: string; author: string; page: string }>();
  for (let i = 0; i < files.length; i += 40) {
    const chunk = files.slice(i, i + 40);
    const data = await api("https://commons.wikimedia.org", {
      action: "query", prop: "imageinfo", iiprop: "extmetadata|url", redirects: "1",
      titles: chunk.map((f) => `File:${f}`).join("|"),
    });
    for (const p of Object.values<{ title: string; missing?: string; imageinfo?: { extmetadata: Record<string, { value: string }>; descriptionurl: string }[] }>(data.query.pages)) {
      const info = p.imageinfo?.[0];
      if (p.missing !== undefined || !info) continue;
      const m = info.extmetadata;
      out.set(p.title.replace(/^File:/, "").replace(/ /g, "_"), {
        license: strip(m.LicenseShortName?.value) || "unknown",
        author: strip(m.Artist?.value) || "unknown",
        page: info.descriptionurl,
      });
    }
    await sleep(300);
  }
  return out;
}

async function main() {
  mkdirSync("public/products", { recursive: true });
  const names = Object.values(priceList).flatMap((rows) => rows.map((r) => r[0]));
  const missingMap = names.filter((n) => !titles[n]);
  if (missingMap.length) throw new Error(`No English title for: ${missingMap.join(", ")}`);

  const allTitles = [...new Set(names.flatMap((n) => titles[n].split("|")))];
  const pages = await leadImages(allTitles);
  const files = [...new Set([...pages.values()].map((p) => p.pageimage).filter((f): f is string => !!f))];
  const licensed = await licenses(files);

  const credits: Record<string, { file: string; license: string; author: string; source: string }> = {};
  const failed: string[] = [];
  const downloaded = new Map<string, string>(); // image file -> local file

  for (const name of names) {
    const slug = slugify(name);
    const choice = titles[name].split("|").map((t) => pages.get(t)).find((p) => p?.pageimage && p.thumbnail && licensed.has(p.pageimage.replace(/ /g, "_")));
    if (!choice) { failed.push(name); continue; }
    const key = choice.pageimage!.replace(/ /g, "_");
    const lic = licensed.get(key)!;
    let local = downloaded.get(key);
    if (!local) {
      const existing = ["jpg", "png", "webp"].map((e) => `${slug}.${e}`).find((f) => existsSync(`public/products/${f}`));
      if (existing) {
        local = existing; // already downloaded in an earlier run
      } else {
        let res = await fetch(choice.thumbnail!.source, { headers: { "User-Agent": UA } });
        for (let wait = 3000; res.status === 429 && wait <= 24000; wait *= 2) {
          await sleep(wait); // rate limited: back off and retry
          res = await fetch(choice.thumbnail!.source, { headers: { "User-Agent": UA } });
        }
        if (!res.ok) { failed.push(`${name} (download ${res.status})`); continue; }
        const type = res.headers.get("content-type") ?? "";
        const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
        local = `${slug}.${ext}`;
        writeFileSync(`public/products/${local}`, Buffer.from(await res.arrayBuffer()));
        await sleep(400);
      }
      downloaded.set(key, local);
    }
    credits[slug] = { file: `/products/${local}`, license: lic.license, author: lic.author, source: lic.page };
  }

  writeFileSync("prisma/data/photos.json", JSON.stringify(credits, null, 2) + "\n");
  const rows = Object.entries(credits).map(([, c]) => `| ${c.file.replace("/products/", "")} | ${c.author.replace(/\|/g, "/")} | ${c.license} | ${c.source} |`);
  writeFileSync(
    "public/products/CREDITS.md",
    `# Example product photos\n\nFrom Wikipedia / Wikimedia Commons. Examples only: replace with your own photos before launch.\nCC BY and CC BY-SA images require attribution when used publicly.\n\n| File | Author | License | Source |\n|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log(`Photos: ${Object.keys(credits).length}/${names.length}. Without a photo: ${failed.length ? failed.join(", ") : "none"}`);
}

main();
