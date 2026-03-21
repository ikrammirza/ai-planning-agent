import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";

export async function generateDOCX(report) {
  const { problemStatement, generatedAt, metadata, stakeholderList, sections } = report;

  const date = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const makeSectionParagraphs = (content) => {
    return content.split("\n").filter(p => p.trim() !== "").map(para =>
      new Paragraph({
        children: [new TextRun({ text: para.trim(), size: 24, font: "Calibri" })],
        spacing: { after: 200 },
      })
    );
  };

  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "AI Strategic Planning Report",
                bold: true,
                size: 56,
                font: "Calibri",
                color: "1a1a2e",
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
          }),

          // Problem statement
          new Paragraph({
            children: [
              new TextRun({
                text: problemStatement,
                size: 32,
                font: "Calibri",
                color: "4a4a8a",
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Date + metadata
          new Paragraph({
            children: [
              new TextRun({ text: `Generated: ${date}`, size: 20, font: "Calibri", color: "888888" }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Type: ${metadata.problemType}   |   Complexity: ${metadata.complexity}   |   Timeline: ${metadata.estimatedTimeline}`, size: 20, font: "Calibri", color: "888888" }),
            ],
            spacing: { after: 400 },
          }),

          // Divider
          new Paragraph({
            border: { bottom: { color: "cccccc", style: BorderStyle.SINGLE, size: 1 } },
            spacing: { after: 400 },
          }),

          // Section 1 — Problem Breakdown
          new Paragraph({
            text: "01 — Problem Breakdown",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...makeSectionParagraphs(sections.problemBreakdown.content),

          // Section 2 — Stakeholders
          new Paragraph({
            text: "02 — Stakeholders",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...makeSectionParagraphs(sections.stakeholders.content),

          // Stakeholder table (simple list)
          ...(stakeholderList || []).map(s =>
            new Paragraph({
              children: [
                new TextRun({ text: `${s.name} (${s.role}): `, bold: true, size: 22, font: "Calibri" }),
                new TextRun({ text: s.needs, size: 22, font: "Calibri" }),
              ],
              spacing: { after: 150 },
              indent: { left: 400 },
            })
          ),

          // Section 3 — Solution Approach
          new Paragraph({
            text: "03 — Solution Approach",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...makeSectionParagraphs(sections.solutionApproach.content),

          // Section 4 — Action Plan
          new Paragraph({
            text: "04 — Action Plan",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...makeSectionParagraphs(sections.actionPlan.content),

          // Key Risks
          new Paragraph({
            text: "Key Risks",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          }),
          ...(metadata.keyRisks || []).map(risk =>
            new Paragraph({
              children: [
                new TextRun({ text: `• ${risk}`, size: 22, font: "Calibri" }),
              ],
              spacing: { after: 100 },
              indent: { left: 400 },
            })
          ),

          // Success Metrics
          new Paragraph({
            text: "Success Metrics",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          }),
          ...(metadata.successMetrics || []).map(metric =>
            new Paragraph({
              children: [
                new TextRun({ text: `✓ ${metric}`, size: 22, font: "Calibri", color: "2d7a2d" }),
              ],
              spacing: { after: 100 },
              indent: { left: 400 },
            })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}


export function generatePDFHTML(report) {
  const { problemStatement, generatedAt, metadata, stakeholderList, sections } = report;

  const date = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const formatContent = (content) =>
    content.split("\n").filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; color: #1a1a2e; background: #fff; padding: 60px; }
  .header { border-bottom: 3px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
  .title { font-size: 36px; font-weight: bold; color: #1a1a2e; margin-bottom: 8px; }
  .problem { font-size: 18px; color: #4a4a8a; font-style: italic; margin-bottom: 12px; }
  .meta { font-size: 13px; color: #888; }
  .section { margin-bottom: 40px; }
  .section-number { font-size: 11px; color: #4a4a8a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
  .section-title { font-size: 22px; font-weight: bold; color: #1a1a2e; margin-bottom: 16px; border-left: 4px solid #4a4a8a; padding-left: 12px; }
  p { font-size: 14px; line-height: 1.8; margin-bottom: 12px; color: #333; }
  .stakeholder { background: #f5f5ff; padding: 12px 16px; margin-bottom: 8px; border-radius: 6px; }
  .stakeholder strong { color: #1a1a2e; }
  .risk { padding: 6px 0; font-size: 14px; color: #c0392b; }
  .metric { padding: 6px 0; font-size: 14px; color: #27ae60; }
  .sub-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; color: #333; }
</style>
</head>
<body>
<div class="header">
  <div class="title">AI Strategic Planning Report</div>
  <div class="problem">${problemStatement}</div>
  <div class="meta">Generated: ${date} &nbsp;|&nbsp; Type: ${metadata.problemType} &nbsp;|&nbsp; Complexity: ${metadata.complexity} &nbsp;|&nbsp; Timeline: ${metadata.estimatedTimeline}</div>
</div>

<div class="section">
  <div class="section-number">Section 01</div>
  <div class="section-title">Problem Breakdown</div>
  ${formatContent(sections.problemBreakdown.content)}
</div>

<div class="section">
  <div class="section-number">Section 02</div>
  <div class="section-title">Stakeholders</div>
  ${formatContent(sections.stakeholders.content)}
  ${(stakeholderList || []).map(s => `
    <div class="stakeholder">
      <strong>${s.name}</strong> — ${s.role}<br/>
      <span style="color:#555">${s.needs}</span>
    </div>
  `).join("")}
</div>

<div class="section">
  <div class="section-number">Section 03</div>
  <div class="section-title">Solution Approach</div>
  ${formatContent(sections.solutionApproach.content)}
</div>

<div class="section">
  <div class="section-number">Section 04</div>
  <div class="section-title">Action Plan</div>
  ${formatContent(sections.actionPlan.content)}
  
  <div class="sub-title">Key Risks</div>
  ${(metadata.keyRisks || []).map(r => `<div class="risk">⚠ ${r}</div>`).join("")}
  
  <div class="sub-title">Success Metrics</div>
  ${(metadata.successMetrics || []).map(m => `<div class="metric">✓ ${m}</div>`).join("")}
</div>
</body>
</html>`;
}