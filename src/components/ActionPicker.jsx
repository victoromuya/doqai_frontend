const ACTIONS = [
  { id: "classify", label: "Classify", hint: "Identify the document type" },
  { id: "extract", label: "Extract text", hint: "Pull all readable text" },
  { id: "rewrite", label: "Rewrite resume", hint: "Tailor the CV to a job description" },
  // { id: "all", label: "All results", hint: "Classification, extracted text, and rewrite" },
];

export default function ActionPicker({ value, onChange, disabled }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 sm:grid sm:grid-cols-3">
        <span className="tag"><span className="tag-dot" />Step 02 — Choose action</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {ACTIONS.map((a) => {
          const active = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(a.id)}
              className={`group relative overflow-hidden rounded-xl border p-5 sm:p-5 text-left transition-all ${
                active
                  ? "border-accent bg-foreground text-background shadow-[6px_6px_0_var(--accent-coral)]"
                  : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/40"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="font-display text-2xl sm:text-2xl">{a.label}</div>
              <div className={`mt-1 font-mono text-[11px] sm:text-[11px] uppercase tracking-widest ${active ? "text-background/70" : "text-muted-foreground"}`}>
                {a.hint}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
