import type { ReactNode } from "react";

export function StepHeader({
  step,
  total,
  title,
  description,
}: {
  step?: number;
  total?: number;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {step && total && (
        <div className="mb-6 flex gap-1.5" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      )}
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}
