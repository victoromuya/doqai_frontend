import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Dropzone from "../components/Dropzone";
import ActionPicker from "../components/ActionPicker";
import ResultPanel from "../components/ResultPanel";
import { processDocument } from "../lib/api";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lexicon — Document Classification & Text Extraction" },
      {
        name: "description",
        content:
          "Upload a PDF, image, or text file. Classify its type and extract its text. Download results as PDF or Word.",
      },
    ],
  }),
});

function Index() {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState("both");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await processDocument(file);
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-5xl px-6 py-14 sm:py-20">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 sm:mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rotate-45 bg-accent" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">
                Lexicon / v1
              </span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Document intelligence
            </span>
          </div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-7xl">
            Read any document.
            <br />
            <span className="italic text-accent">Know what it is.</span>
          </h1>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Drop a PDF, image, or text file. Our model classifies it — resume,
            questionnaire, invoice, or otherwise — and pulls every readable
            character out for you.
          </p>
        </header>

        {/* Workflow */}
        <div className="space-y-10">
          <Dropzone file={file} onFile={(f) => { setFile(f); setResult(null); setError(""); }} />

          <ActionPicker value={action} onChange={setAction} disabled={loading} />

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={submit}
              disabled={!file || loading}
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-background" />
                  Processing…
                </>
              ) : (
                <>
                  Run analysis
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
            {error && (
              <span className="font-mono text-xs text-destructive">{error}</span>
            )}
          </div>

          {result && (
            <ResultPanel
              result={result}
              action={action}
              fileName={file?.name}
              onReset={reset}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 flex items-center justify-between border-t border-border pt-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © Lexicon
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            classify · extract · export
          </span>
        </footer>
      </div>
    </main>
  );
}
