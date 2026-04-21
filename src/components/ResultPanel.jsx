import { downloadPdf, downloadDocx } from "../lib/exporters";

export default function ResultPanel({ result, action, fileName, onReset }) {
  if (!result) return null;
  const showClass = action === "classify" || action === "both";
  const showText = action === "extract" || action === "both";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="noise" />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <span className="tag"><span className="tag-dot" />Report</span>
          <span className="font-mono text-xs text-muted-foreground">{fileName}</span>
        </div>
        <button
          onClick={onReset}
          className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          ↺ New document
        </button>
      </div>

      {showClass && (
        <div className="mt-6">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Document type
          </div>
          <div className="mt-2 font-display text-5xl leading-none text-foreground sm:text-6xl">
            <span className="caret">{result.document_type || "—"}</span>
          </div>
          {result.message && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">{result.message}</p>
          )}
        </div>
      )}

      {showText && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Extracted text
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadPdf({ fileName, documentType: result.document_type, text: result.text })}
                className="rounded-md border border-foreground bg-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-background hover:bg-accent hover:border-accent"
              >
                ↓ PDF
              </button>
              <button
                onClick={() => downloadDocx({ fileName, documentType: result.document_type, text: result.text })}
                className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground hover:border-accent hover:text-accent"
              >
                ↓ Word
              </button>
            </div>
          </div>
          <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-5 font-mono text-sm leading-relaxed text-foreground">
{result.text || "(no text returned)"}
          </pre>
        </div>
      )}
    </section>
  );
}
