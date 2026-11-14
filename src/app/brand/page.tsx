import type { Metadata } from "next";
import { Logo, LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Брандбук", robots: { index: false, follow: false } };

const colors = [
  { name: "Горско зелено", token: "forest", hex: "#0B662D", use: "Основен цвят: хедър лента, хиро, бутони, заглавия, лого." },
  { name: "Тъмно зелено", token: "forest-dark", hex: "#084A21", use: "Футър, текст върху светло-зелени фонове." },
  { name: "Лайм", token: "lime", hex: "#79BF21", use: "Акцент: етикети, рамки, фокус, декоративни детайли." },
  { name: "Оранжево", token: "orange", hex: "#F68624", use: "Само за главното действие на страницата (CTA)." },
  { name: "Слънчево жълто", token: "sun", hex: "#F9DB09", use: "Рядко: специални етикети и предупреждения за промоции." },
  { name: "Мастило", token: "ink", hex: "#1F232B", use: "Основен текст и заглавия." },
  { name: "Мъгла", token: "mist", hex: "#F2F3F7", use: "Фон на секции, разделители между блокове." },
  { name: "Светъл лайм", token: "accent", hex: "#EAF5D9", use: "Плочки на категории, фон на етикети." },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b pb-2 text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-10" data-testid="brand-page">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold">Брандбук</h1>
        <p className="text-muted-foreground">
          Работно име: „Пресни плодове“ (може да се смени). Тоновете, шрифтовете и компонентите по-долу са
          същите, които ползва сайтът, така че тази страница е и преглед на дизайн системата.
        </p>
      </header>

      <Section title="1. Личност на марката">
        <p>
          Надежден ежедневен доставчик за професионални кухни. Свеж, точен, делови и топъл. Не сме луксозна
          бутикова марка, нито евтин пазар: гордеем се с редовност, точни тегла и коректни документи.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Свежо</b> — ярко зелено, много бял фон, чисти снимки на продукти.</li>
          <li><b>Надеждно</b> — ясни срокове, цени, условия; без скрити неща.</li>
          <li><b>Делово</b> — към „Вие“, кратки изречения, конкретни факти.</li>
        </ul>
      </Section>

      <Section title="2. Лого">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center rounded-xl border p-8"><Logo /></div>
          <div className="flex items-center justify-center rounded-xl bg-forest p-8"><Logo onDark /></div>
          <div className="flex items-center justify-center rounded-xl border p-8"><LogoMark className="size-16" /></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Знак (лист в кръг) + надпис в Montserrat ExtraBold. Свободно място около лого — поне височината на знака.
          Върху тъмно зелено се ползва бялата версия. Знакът се ползва самостоятелно като иконка на сайта.
        </p>
      </Section>

      <Section title="3. Цветове">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map((c) => (
            <div key={c.token} className="overflow-hidden rounded-xl border" data-testid="brand-color">
              <div className="h-20" style={{ background: c.hex }} />
              <div className="space-y-1 p-3">
                <p className="font-heading font-bold">{c.name}</p>
                <p className="font-mono text-xs">{c.hex}</p>
                <p className="text-xs text-muted-foreground">{c.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Правило 60-30-10: 60% бяло и „мъгла“, 30% зелено, 10% акценти (лайм и оранжево). Оранжевото е на един
          бутон на екран. Бял текст върху горско зелено и оранжево има достатъчен контраст за четене.
        </p>
      </Section>

      <Section title="4. Шрифтове">
        <div className="space-y-4 rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Заглавия — Montserrat (600/700/800), кирилица</p>
          <p className="font-heading text-4xl font-extrabold">Пресни плодове и зеленчуци</p>
          <p className="font-heading text-2xl font-bold">Доставка до вашия обект</p>
          <p className="pt-2 text-sm text-muted-foreground">Текст — Open Sans (400/600), кирилица</p>
          <p>
            Доставяме всяка сутрин в избрани дни. Поръчайте до крайния час за вашия район и получете фактура с
            точните тегла на продуктите.
          </p>
          <p className="text-sm">Малък текст и етикети: 14 px. Основен текст: 16 px. Заглавия: 24–48 px.</p>
        </div>
      </Section>

      <Section title="5. Форма и пространство">
        <ul className="list-disc space-y-1 pl-5">
          <li>Карти и плочки: заоблени ъгли ~14 px (`rounded-xl`), тънка сива рамка, лека сянка при преминаване с мишка.</li>
          <li>Бутони и етикети: напълно заоблени (пилюла).</li>
          <li>Секции: голямо вертикално пространство (56–96 px), редуване на бял и „мъгла“ фон.</li>
          <li>Максимална ширина на съдържанието: 1152 px; мобилен първо, отстъп 16 px.</li>
        </ul>
      </Section>

      <Section title="6. Бутони и компоненти">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-6">
          <Button variant="cta" size="lg">Към каталога</Button>
          <Button size="lg">Основен</Button>
          <Button variant="outline" size="lg">Вторичен</Button>
          <div className="rounded-xl bg-forest p-3"><Button variant="onDark" size="lg">Върху зелено</Button></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 rounded-xl border bg-card p-4">
            <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-muted-foreground">Снимка</div>
            <p className="font-semibold">Домати розови</p>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">България</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl bg-accent p-6 text-center">
            <LogoMark className="size-10" />
            <span className="font-heading font-bold text-forest-dark">Плочка на категория</span>
          </div>
          <div className="space-y-2 rounded-xl bg-forest p-6 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-orange font-heading text-lg font-extrabold">1</span>
            <p className="font-bold">Стъпка от процеса</p>
          </div>
        </div>
      </Section>

      <Section title="7. Тон на общуване">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="mb-2 font-bold text-forest">Да</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>„Доставяме във вторник, четвъртък и събота. Поръчайте до 20:00 предния ден.“</li>
              <li>Обръщение на „Вие“, кратки изречения, конкретни срокове и суми.</li>
              <li>Казваме какво получава клиентът: точно тегло, фактура, ценова листа.</li>
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <p className="mb-2 font-bold text-destructive">Не</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Празни суперлативи: „най-добрите цени“, „неповторимо качество“.</li>
              <li>Дълги блокове главни букви извън големите заглавия.</li>
              <li>Здравни твърдения за продуктите („лекува“, „детоксикира“).</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="8. Снимки">
        <ul className="list-disc space-y-1 pl-5">
          <li>Продукти на светъл неутрален фон, добра светлина, без текст върху снимката; квадратен кадър за карти.</li>
          <li>За секции с настроение: кухни, щандове, кашони — реални, не стокови снимки с усмихнати хора.</li>
          <li>Докато няма снимки, се ползва иконка в „мъгла“ плочка (както в каталога).</li>
        </ul>
      </Section>

      <Section title="9. Вдъхновение">
        <p className="text-sm">
          Проучени са fruitdirect.bg (основна референция: зелена палитра с оранжев акцент, големи заглавия, процес
          „Как работим“, сегменти клиенти) и svejadostavka.bg (категории с плочки, предимства, ясна доставка).
          Заимствани са структурата на страницата и общото настроение; логото, текстовете и снимките са наши.
          Разликата: при нас клиентите виждат реалните си цени и поръчват онлайн, а не само чрез запитване.
        </p>
      </Section>
    </main>
  );
}
