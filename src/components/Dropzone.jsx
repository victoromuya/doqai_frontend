import { useRef, useState } from "react";

const ACCEPT = ".png,.jpg,.jpeg,.pdf,.txt";

export default function Dropzone({ file, onFile }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const pick = (f) => {
    if (!f) return;

    // 1. Define the limit (1024 KB = 1,048,576 Bytes)
    const MAX_SIZE = 1024 * 1024; 

    // 2. Check file size
    if (f.size > MAX_SIZE) {
      alert(`File is too large. Please upload a document smaller than 1MB (1024 KB).`);
      // Reset the input so the same large file can't be "picked" again immediately
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onFile(f);
  };

  // ... rest of your component code remains the same ...


  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-card/60 p-10 transition-colors ${
        drag ? "border-accent" : "border-border hover:border-foreground/40"
      }`}
    >
      {drag && <div className="scanline" />}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="tag">
          <span className="tag-dot" />
          <span>Step 01 — Upload</span>
        </div>

        {file ? (
          <>
            <p className="font-display text-3xl text-foreground">{file.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB · {file.type || "unknown"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
              className="mt-2 font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
            >
              Replace file →
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              Drop a document, <span className="italic text-accent">or click to browse</span>
            </p>
            <p className="max-w-md font-mono text-xs uppercase tracking-widest text-muted-foreground">
              PNG · JPG · JPEG · PDF · TXT - not more that 1000KB 
            </p>
          </>
        )}
      </div>
    </div>
  );
}
