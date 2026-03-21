import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { problem } = await request.json();
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Step 1 — Planner Agent
    console.log("Running Planner Agent...");
    const planRes = await fetch(`${base}/api/agent/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem }),
    });
    const planJson = await planRes.json();
    if (!planJson.success) throw new Error("Planner failed: " + planJson.error);
    const planData = planJson.data;

    // Step 2 — Insight Agent (receives planner output)
    console.log("Running Insight Agent...");
    const insightRes = await fetch(`${base}/api/agent/insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem, planData }),
    });
    const insightJson = await insightRes.json();
    if (!insightJson.success) throw new Error("Insight failed: " + insightJson.error);
    const insightData = insightJson.data;

    // Step 3 — Execution Agent (receives both outputs)
    console.log("Running Execution Agent...");
    const executeRes = await fetch(`${base}/api/agent/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem, planData, insightData }),
    });
    const executeJson = await executeRes.json();
    if (!executeJson.success) throw new Error("Execution failed: " + executeJson.error);

    return NextResponse.json({ success: true, data: executeJson.data });
  } catch (error) {
    console.error("Agent chain error:", error);
    return NextResponse.json(
      { error: "Agent chain failed", details: error.message },
      { status: 500 }
    );
  }
}