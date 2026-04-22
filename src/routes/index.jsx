import { useState, useEffect, useMemo,  } from "react";
import Dropzone from "../components/Dropzone";
import ActionPicker from "../components/ActionPicker";
import ResultPanel from "../components/ResultPanel";
import { processDocument } from "../lib/api";
import { extractOnly } from "../lib/api";

import { Textarea } from "../components/ui/textarea";


export default function Index() {

const ACTION_PROGRESS = {
  classify: ["Uploading file", "Classifying document"],
  extract: ["Uploading file", "Extracting text"],
  rewrite: ["Uploading file", "Rewriting resume"],
  // all: ["Uploading file", "Classifying document", "Extracting text", "Rewriting resume"],
};

 const [file, setFile] = useState(null);
  const [action, setAction] = useState("classify");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const needsJobDescription = action === "rewrite" //|| action === "all";
  const progressSteps = useMemo(() => ACTION_PROGRESS[action] || ACTION_PROGRESS.all, [action]);

  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(0);
    if (progressSteps.length < 2) return;

    const interval = window.setInterval(() => {
      setCurrentStep((step) => (step < progressSteps.length - 1 ? step + 1 : step));
    }, 1100);

    return () => window.clearInterval(interval);
  }, [loading, progressSteps]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setJobDescription("");
  };

 const submit = async () => {
  if (!file) return;

  if (needsJobDescription && !jobDescription.trim()) {
    setError("Add a job description to rewrite the resume.");
    return;
  }

  setLoading(true);
  setError("");
  setResult(null);

  try {
    let data;

    if (action === "extract") {
      data = await extractOnly(file);
    } else {
      data = await processDocument(file, {
        jobDescription: needsJobDescription ? jobDescription.trim() : "",
      });
    }

    setResult(data);
  } catch (e) {
    // keep your existing backend-aware error handling
    const displayMessage =
      e.data?.message || e.message || "Something went wrong. Please try again.";
    setError(displayMessage);
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
            questionnaire, invoice, or otherwise — pulls every readable
            character out, and can rewrite a resume for a target role.
          </p>
        </header>

        {/* Workflow */}
        <div className="space-y-10">
          <Dropzone file={file} onFile={(f) => { setFile(f); setResult(null); setError(""); }} />

          <ActionPicker value={action} onChange={setAction} disabled={loading} />

          {needsJobDescription && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="tag"><span className="tag-dot" />Step 03 — Add job description</span>
              </div>
              <div className="field-shell p-4">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here so the resume can be tailored to the role."
                  disabled={loading}
                  className="min-h-40 border-0 bg-transparent px-0 py-0 font-mono text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={submit}
              disabled={!file || loading}
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-background/40 border-t-background" />
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

          {loading && (
            <section className="animate-fade-in rounded-2xl border border-border bg-card/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/35 border-t-accent" />
                </span>
                <div>
                  <div className="font-display text-2xl text-foreground">Processing your document</div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Follow each stage as the response is prepared
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {progressSteps.map((step, index) => {
                  const done = index < currentStep;
                  const active = index === currentStep;

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                        active
                          ? "border-accent bg-secondary"
                          : done
                            ? "border-border bg-background"
                            : "border-border bg-card"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-foreground">
                        {done ? (
                          "✓"
                        ) : active ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/35 border-t-accent" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="flex-1">
                        <div className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">{step}</div>
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {done ? "Done" : active ? "Working" : "Queued"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

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
