interface SectionLabelProps {
  label: string;
  description?: string;
}

export function SectionLabel({ label, description }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-border" />
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-3">
          {label}
        </span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
