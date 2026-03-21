import { NextResponse } from "next/server";
import { generateDOCX, generatePDFHTML } from "@/lib/exportHelpers";

export async function POST(request) {
  try {
    const { report, format } = await request.json();

    if (!report || !format) {
      return NextResponse.json(
        { error: "report and format are required" },
        { status: 400 }
      );
    }

    if (format === "docx") {
      const buffer = await generateDOCX(report);
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="planning-report.docx"`,
        },
      });
    }

    if (format === "pdf") {
      // We return the HTML — the frontend will use browser print to save as PDF
      const html = generatePDFHTML(report);
      return NextResponse.json({ success: true, html });
    }

    return NextResponse.json({ error: "Invalid format. Use docx or pdf" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Export failed", details: error.message },
      { status: 500 }
    );
  }
}
