import { SearchX } from "lucide-react";
import { ButtonLink } from "@/component/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX className="size-7" />
      </span>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <ButtonLink href="/" className="mt-6">Go home</ButtonLink>
    </div>
  );
}
