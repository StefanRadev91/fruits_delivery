# Пресни плодове — B2B доставка на плодове и зеленчуци

Next.js (App Router) + TypeScript + PostgreSQL/Prisma + Auth.js + Tailwind/shadcn.
Интерфейсът е на български (текстовете са в `src/i18n`). Засега сайтът е само за бизнеса; домашната доставка (B2C) е изключена с флаг.

## Бърз старт

```bash
pnpm install
cp .env.example .env          # после сменете AUTH_SECRET: openssl rand -base64 32
pnpm db:up                    # Postgres + Mailpit през Docker (docker-compose.yml)
pnpm exec prisma migrate deploy
pnpm db:seed                  # демо данни: продукти, зони, фирми, потребители
pnpm dev                      # http://localhost:3000
```

Без Docker: насочете `DATABASE_URL` към собствен Postgres. Mailpit (http://localhost:8025) е само за локално тестване на имейли.

Демо потребители (парола `demo1234`): `admin@fruits.local`, `staff@fruits.local`, `owner@roza.example` (фирма с ценова листа −8%), `ivana@example.bg`.
**Seed-ът изтрива всички данни** и отказва да работи при `NODE_ENV=production`.

## Променливи на средата

| Име | Какво е |
|---|---|
| `DATABASE_URL` | Postgres адрес |
| `AUTH_SECRET` | таен ключ за сесиите (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | `true` зад proxy / на хостинг |
| `APP_URL` | публичен адрес на сайта (sitemap, линкове във вход с имейл) |
| `NEXT_PUBLIC_B2C_ENABLED` | `true` включва домашната доставка. По подразбиране `false` |
| `NEXT_PUBLIC_SHOW_BGN` | `true` показва и лева (курс 1.95583) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | поща за вход с линк и известия |
| `CRON_SECRET` | за ендпойнта на постоянните поръчки (предстои) |

## Тестове

```bash
pnpm lint && pnpm typecheck && pnpm test   # юнит тестове (Vitest), без база
pnpm test:e2e                              # Playwright; нужни са база с seed и `pnpm dev`
```

## Каталог и цени

- Продуктите и цените са в `prisma/data/price-list.ts` (от ценовата оферта на доставчика).
  Нашата цена = цената на доставчика минус `OUR_REDUCTION_PERCENT`.
- `pnpm price-list [файл.csv]` експортира ценоразпис за преглед.
- `pnpm photos` сваля **примерни** снимки от Wikimedia Commons (`public/products`, автори в `CREDITS.md`). Подменете със собствени преди пускане.
- Брандбук и дизайн система: `/brand`.

## Статус

Готово: основа и конфигурация, домейн логика (пари, ДДС, цени, променливо тегло, краен час, постоянни поръчки) с тестове, схема и seed, вход (парола и линк по имейл) с роли, публични страници и каталог.
Предстои: регистрация и одобрение на фирми, поръчване, постоянни поръчки, админ панел (подготовка на поръчки, тегла), PDF фактури.
