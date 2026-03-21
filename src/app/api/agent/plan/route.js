import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { problem } = await request.json();

    if (!problem || problem.trim() === "") {
      return NextResponse.json(
        { error: "Problem statement is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a strategic Planner Agent. Your job is to break down a problem statement into its core components.

Problem: "${problem}"

Analyze this problem and break it down into exactly these components. Respond ONLY with valid JSON, no markdown, no explanation, just the JSON object:

{
  "coreChallenge": "One sentence describing the heart of the problem",
  "components": [
    "Component 1",
    "Component 2", 
    "Component 3",
    "Component 4",
    "Component 5"
  ],
  "problemType": "e.g. Platform / Marketplace / Tool / Service / System",
  "complexity": "Low / Medium / High",
  "estimatedTimeline": "e.g. 3-6 months"
}
`;

    const raw = await callGemini(prompt);

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const planData = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data: planData });
  } catch (error) {
    console.error("Planner Agent error:", error);
    return NextResponse.json(
      { error: "Planner agent failed", details: error.message },
      { status: 500 }
    );
  }
}