import jsPDF from "jspdf";
import { AlignmentType, Document, HeadingLevel, LevelFormat, Packer, Paragraph, TextRun } from "docx";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;

function baseName(name) {
  if (!name) return "extracted-text";
  return name.replace(/\.[^.]+$/, "");
}

function buildTitle(kind) {
  if (kind === "rewrite") return "Rewritten Resume";
  return "Extracted Text";
}

function buildFileName(name, kind, extension) {
  const suffix = kind === "rewrite" ? "rewritten-resume" : "extracted-text";
  return `${baseName(name)}-${suffix}.${extension}`;
}

function toParagraphs(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function isHeadingLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^[A-Z][A-Z\s/&-]{2,}$/.test(trimmed)) return true;
  return /^[A-Z][A-Za-z\s/&-]{2,}:$/.test(trimmed);
}

function parseResumeContent(text, kind) {
  if (kind !== "rewrite") {
    return toParagraphs(text).map((content) => ({ type: "paragraph", content }));
  }

  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const blocks = [];
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push({ type: "paragraph", content: paragraphBuffer.join(" ") });
    paragraphBuffer = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      continue;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      blocks.push({ type: "heading", content: line.replace(/:$/, "") });
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "bullet", content: line.replace(/^[-*•]\s+/, "") });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks.length ? blocks : [{ type: "paragraph", content: String(text || "") }];
}

export function downloadPdf({ fileName, documentType, text, kind }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const blocks = parseResumeContent(text, kind);

  const ensureSpace = (heightNeeded = 16) => {
    if (y + heightNeeded <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(buildTitle(kind), margin, margin);

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  let y = margin + 22;
  if (documentType) {
    doc.text(`Document type: ${documentType}`, margin, y);
    y += 16;
  }
  doc.text(`Source file: ${fileName || "—"}`, margin, y);
  y += 20;

  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  for (const block of blocks.length ? blocks : [{ type: "paragraph", content: "" }]) {
    if (block.type === "heading") {
      ensureSpace(22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(String(block.content).toUpperCase(), margin, y);
      y += 18;
      continue;
    }

    if (block.type === "bullet") {
      doc.setFont("times", "normal");
      doc.setFontSize(11.5);
      const bulletIndent = margin + 18;
      const lines = doc.splitTextToSize(block.content, maxWidth - 18);
      lines.forEach((line, index) => {
        ensureSpace(16);
        if (index === 0) {
          doc.text("•", margin, y);
        }
        doc.text(line, bulletIndent, y);
        y += 15;
      });
      y += 6;
      continue;
    }

    doc.setFont("times", "normal");
    doc.setFontSize(11.5);
    const lines = doc.splitTextToSize(block.content, maxWidth);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 15;
    }
    y += 10;
  }

  doc.save(buildFileName(fileName, kind, "pdf"));
}

export async function downloadDocx({ fileName, documentType, text, kind }) {
  const blocks = parseResumeContent(text, kind);
  const paragraphs = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: buildTitle(kind), bold: true })],
    }),
  ];
  if (documentType) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Document type: ", bold: true }),
          new TextRun(documentType),
        ],
      })
    );
  }
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Source file: ", bold: true }),
        new TextRun(fileName || "—"),
      ],
    })
  );
  paragraphs.push(new Paragraph({ children: [new TextRun("")] }));

  for (const block of blocks) {
    if (block.type === "heading") {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: block.content, bold: true })],
        })
      );
      continue;
    }

    if (block.type === "bullet") {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          numbering: { reference: "resume-bullets", level: 0 },
          children: [new TextRun(block.content)],
        })
      );
      continue;
    }

    paragraphs.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun(block)],
      })
    );
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "resume-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 260 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [{ children: paragraphs }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, buildFileName(fileName, kind, "docx"));
}
