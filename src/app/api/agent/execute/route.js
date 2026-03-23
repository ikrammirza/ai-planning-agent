import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";

function extractString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, val]) => `${key}:\n${val}`)
      .join("\n\n");
  }
  return String(value ?? "");
}

export async function POST(request) {
  try {
    const { problem, planData, insightData } = await request.json();

    const prompt = `
You are an Execution Agent. You receive all the research and planning done by previous agents and produce a final, professional, structured report.

Original Problem: "${problem}"

Planning Data:
- Core Challenge: ${planData.coreChallenge}
- Components: ${planData.components.join(", ")}
- Type: ${planData.problemType}
- Complexity: ${planData.complexity}
- Timeline: ${planData.estimatedTimeline}

Insight Data:
- Market Context: ${insightData.marketContext}
- Key Risks: ${insightData.keyRisks.join(", ")}
- Success Metrics: ${insightData.successMetrics.join(", ")}

Write a complete professional report. Respond ONLY with valid JSON, no markdown, no explanation.

IMPORTANT: Every value must be a plain string. Do NOT nest objects inside any value.

{
  "problemBreakdown": "Write 3-4 detailed paragraphs as a single plain text string covering what the problem is, why it exists, what makes it complex, and what solving it would unlock.",
  "stakeholders": "Write 2-3 paragraphs as a single plain text string describing who is affected, what each group needs, and how their needs sometimes conflict.",
  "solutionApproach": "Write 3-4 paragraphs as a single plain text string describing the recommended strategic approach, key decisions, technology considerations, and why this approach over alternatives.",
  "actionPlan": "Write the full action plan as a single plain text string covering Phase 1 Foundation weeks 1-4, Phase 2 Core Build weeks 5-12, Phase 3 Launch and Iterate weeks 13-20. Include specific deliverables for each phase. Do not use nested objects."
}
`;

    const raw = await callGroq(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const reportData = JSON.parse(cleaned);

    const finalReport = {
      problemStatement: problem,
      generatedAt: new Date().toISOString(),
      metadata: {
        problemType: planData.problemType,
        complexity: planData.complexity,
        estimatedTimeline: planData.estimatedTimeline,
        successMetrics: insightData.successMetrics,
        keyRisks: insightData.keyRisks,
      },
      stakeholderList: insightData.stakeholders,
      sections: {
        problemBreakdown: {
          title: "Problem Breakdown",
          content: extractString(reportData.problemBreakdown),
        },
        stakeholders: {
          title: "Stakeholders",
          content: extractString(reportData.stakeholders),
        },
        solutionApproach: {
          title: "Solution Approach",
          content: extractString(reportData.solutionApproach),
        },
        actionPlan: {
          title: "Action Plan",
          content: extractString(reportData.actionPlan),
        },
      },
    };

    return NextResponse.json({ success: true, data: finalReport });
  } catch (error) {
    console.error("Execution Agent error:", error);
    return NextResponse.json(
      { error: "Execution agent failed", details: error.message },
      { status: 500 }
    );
  }
}