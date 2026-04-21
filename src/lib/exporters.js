import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;

function baseName(name) {
  if (!name) return "extracted-text";
  return name.replace(/\.[^.]+$/, "");
}

export function downloadPdf({ fileName, documentType, text }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text("Extracted Text", margin, margin);

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

  doc.setFontSize(12);
  const lines = doc.splitTextToSize(text || "", maxWidth);
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  }

  doc.save(`${baseName(fileName)}.pdf`);
}

export async function downloadDocx({ fileName, documentType, text }) {
  const paragraphs = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "Extracted Text", bold: true })],
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

  const blocks = (text || "").split(/\n+/);
  for (const block of blocks) {
    paragraphs.push(new Paragraph({ children: [new TextRun(block)] }));
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${baseName(fileName)}.docx`);
}
