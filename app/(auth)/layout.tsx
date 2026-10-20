import { BellRing } from "lucide-react";
import { Logo } from "@/component/shared/logo";
import { ThemeToggle } from "@/component/shared/theme-toggle";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const STRIP = Array.from({ length: 14 }, (_, i) => i + 8);

function stripDay(d: number) {
  if (d <= 12) return "bg-[#dc329b] text-white";
  if (d === 22) return "bg-[#834d8b] text-white";
  if (d >= 17) return "bg-[#68e2dd]/20 text-[#a7f0ec]";
  return "bg-white/10 text-white/60";
}

/** Decorative brand panel shown beside the sign-in and onboarding forms on large screens. */
function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#217580] via-[#174f57] to-[#0a2342] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
      {/* Texture and glows */}
      <div
        aria-hidden
        className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div aria-hidden className="absolute -right-24 -bottom-32 size-[420px] rounded-full bg-[#dc329b]/30 blur-[110px]" />
      <div aria-hidden className="absolute -top-24 -left-24 size-80 rounded-full bg-[#68e2dd]/20 blur-[100px]" />

      <div className="relative">
        <Logo tone="inverse" />
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl leading-tight font-semibold tracking-tight xl:text-[2.75rem]">
          Your health story,
          <br />
          <span className="text-[#f6b3d9]">in your hands.</span>
        </h2>
        <p className="mt-4 text-white/70">
          Track your cycle, understand your body and talk privately with a specialist whenever you need.
        </p>

        {/* Product preview */}
        <div className="relative mt-12">
          <div className="animate-pop-in rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">My cycle</p>
                <p className="font-semibold">Cycle day 13</p>
              </div>
              <span className="rounded-full bg-[#68e2dd]/20 px-3 py-1 text-xs font-medium text-[#a7f0ec]">Fertile window</span>
            </div>
            <div className="mt-4 flex justify-between gap-1">
              {STRIP.map((d) => (
                <span
                  key={d}
                  className={cn(
                    "flex aspect-square w-full max-w-7 items-center justify-center rounded-full text-[10px] font-medium",
                    stripDay(d),
                    d === 20 && "border-2 border-dotted border-white",
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/75">
              <BellRing className="size-3.5 text-[#f6d38f]" /> Next period in 16 days
            </div>
          </div>
        </div>


      </div>

      <p className="relative text-xs text-white/50">{APP_NAME} gives guidance, not a medical diagnosis.</p>
    </aside>
  );
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[1fr_1.1fr]">
      <BrandPanel />

      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:pb-20">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
