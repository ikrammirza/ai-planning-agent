import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { problem, planData } = await request.json();

    const prompt = `
You are an Insight Agent. You receive a problem and its breakdown, and you enrich it with deep reasoning, context, and real-world insights.

Original Problem: "${problem}"

Planner's Breakdown:
- Core Challenge: ${planData.coreChallenge}
- Components: ${planData.components.join(", ")}
- Problem Type: ${planData.problemType}
- Complexity: ${planData.complexity}

Your job is to enrich this with insights. Respond ONLY with valid JSON, no markdown, no explanation:

{
  "stakeholders": [
    { "name": "Stakeholder name", "role": "Their role", "needs": "What they need from this solution" },
    { "name": "Stakeholder name", "role": "Their role", "needs": "What they need from this solution" },
    { "name": "Stakeholder name", "role": "Their role", "needs": "What they need from this solution" }
  ],
  "keyRisks": [
    "Risk 1",
    "Risk 2",
    "Risk 3"
  ],
  "marketContext": "2-3 sentences about the market landscape and why this problem matters now",
  "successMetrics": [
    "Metric 1",
    "Metric 2",
    "Metric 3"
  ]
}
`;

    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const insightData = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data: insightData });
  } catch (error) {
    console.error("Insight Agent error:", error);
    return NextResponse.json(
      { error: "Insight agent failed", details: error.message },
      { status: 500 }
    );
  }
}