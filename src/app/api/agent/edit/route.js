import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { sectionTitle, currentContent, editInstruction } = await request.json();

    if (!sectionTitle || !currentContent || !editInstruction) {
      return NextResponse.json(
        { error: "sectionTitle, currentContent and editInstruction are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a professional report editor. You will be given a section of a business report and an instruction on how to edit it.

Section Title: "${sectionTitle}"

Current Content:
${currentContent}

Edit Instruction: "${editInstruction}"

Rules:
- Apply the instruction precisely
- Keep the same professional report tone
- Do NOT add headers or titles — just the content paragraphs
- Do NOT wrap in markdown or quotes
- Return ONLY the rewritten section content as plain text

Rewritten content:
`;

    const edited = await callGemini(prompt);

    return NextResponse.json({ success: true, data: { content: edited.trim() } });
  } catch (error) {
    console.error("Edit Agent error:", error);
    return NextResponse.json(
      { error: "Edit agent failed", details: error.message },
      { status: 500 }
    );
  }
}