import { cn } from "@/lib/utils";

/** Leaf mark. Kept as inline SVG so it follows the brand colors. */
export function LogoMark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill={onDark ? "#ffffff" : "#0b662d"} />
      <path d="M9 21c0-6.5 4.5-11 13-11 0 8.5-4.5 13-11 13-.8 0-1.4-.1-2-.3z" fill="#79bf21" />
      <path d="M10 22c3-4 6-6.5 9-8" stroke={onDark ? "#0b662d" : "#fff"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight", onDark ? "text-white" : "text-forest", className)}>
      <LogoMark onDark={onDark} />
      Пресни плодове
    </span>
  );
}
