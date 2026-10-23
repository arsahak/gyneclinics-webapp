import Image from "next/image";
import { Logo } from "@/component/shared/logo";
import { ThemeToggle } from "@/component/shared/theme-toggle";
import { APP_NAME } from "@/lib/brand";

/**
 * Brand panel beside the sign-in and onboarding forms on large screens. Same
 * look as the mobile app's login: brand gradient, soft circles and the
 * dancing GyneX figure.
 */
function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#a67fb7] via-[#804898] to-[#207898] p-12 text-white lg:flex lg:flex-col lg:items-center lg:justify-center xl:p-14">
      {/* Soft circles */}
      <div aria-hidden className="absolute -top-32 -right-28 size-[440px] rounded-full bg-white/[0.13]" />
      <div aria-hidden className="absolute -bottom-24 -left-36 size-[380px] rounded-full bg-white/[0.08]" />

      <div className="relative flex max-w-md flex-col items-center text-center">
        <Image
          src="/assets/logo/gynexapp-icon.png"
          alt=""
          width={601}
          height={887}
          sizes="120px"
          priority
          className="animate-sway h-36 w-auto brightness-0 invert"
        />
        <h2 className="mt-8 text-4xl leading-tight font-bold tracking-tight xl:text-[2.75rem]">
          Women&apos;s health,
          <br />
          in your pocket.
        </h2>
        <p className="mt-4 text-white/85">Track your cycle and talk to verified doctors.</p>
      </div>

      <p className="absolute bottom-10 text-xs text-white/60">{APP_NAME} gives guidance, not a medical diagnosis.</p>
    </aside>
  );
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[1fr_1.1fr]">
      <BrandPanel />

      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:pb-20">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
