import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

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

Write a complete professional report. Respond ONLY with valid JSON, no markdown, no explanation:

{
  "problemBreakdown": "Write 3-4 detailed paragraphs covering: what the problem actually is, why it exists, what makes it complex, and what solving it would unlock. Be specific and analytical.",
  "stakeholders": "Write 2-3 paragraphs describing who is affected by this problem, what each group needs, and how their needs sometimes conflict. Reference the stakeholders found in research.",
  "solutionApproach": "Write 3-4 paragraphs describing the recommended strategic approach to solving this problem. Cover the high-level architecture, key decisions to make, technology or process considerations, and why this approach over alternatives.",
  "actionPlan": "Write a detailed action plan covering Phase 1 (Foundation, weeks 1-4), Phase 2 (Core Build, weeks 5-12), Phase 3 (Launch & Iterate, weeks 13-20). Each phase should have specific deliverables and milestones."
}
`;

    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const reportData = JSON.parse(cleaned);

    // Build the final complete report object
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
          content: reportData.problemBreakdown,
        },
        stakeholders: {
          title: "Stakeholders",
          content: reportData.stakeholders,
        },
        solutionApproach: {
          title: "Solution Approach",
          content: reportData.solutionApproach,
        },
        actionPlan: {
          title: "Action Plan",
          content: reportData.actionPlan,
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