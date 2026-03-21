"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Planner Agent", desc: "Breaking down your problem..." },
  { id: 2, label: "Insight Agent", desc: "Enriching with context & research..." },
  { id: 3, label: "Execution Agent", desc: "Writing your strategic report..." },
];

const EXAMPLES = [
  "Build a creator marketplace platform",
  "Launch a SaaS product for small restaurants",
  "Create an online learning platform for coding",
  "Build a healthcare appointment booking system",
];

export default function Home() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!problem.trim()) {
      setError("Please enter a problem statement first.");
      return;
    }
    setError("");
    setLoading(true);
    setCurrentStep(1);

    try {
      // Simulate step progression for UX
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 4000);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 9000);

      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problem.trim() }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      const json = await res.json();

      // Store report in sessionStorage and navigate to report page
      sessionStorage.setItem("report", JSON.stringify(json.data));
      router.push("/report");
    } catch (err) {
      setError(err.message || "Failed to generate report. Please try again.");
      setLoading(false);
      setCurrentStep(0);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>

      {/* Logo / Brand */}
      <div style={{ textAlign: "center", marginBottom: "48px" }} className="fade-up">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "100px", padding: "8px 20px", marginBottom: "24px",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#6366f1",
            animation: "pulse-ring 2s infinite",
          }} />
          <span style={{ color: "#818cf8", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em" }}>
            AI PLANNING AGENT
          </span>
        </div>

        <h1 className="font-serif" style={{
          fontSize: "clamp(36px, 6vw, 64px)", color: "#ffffff",
          lineHeight: 1.15, marginBottom: "16px",
        }}>
          Turn any problem into<br />
          <span style={{ color: "#818cf8" }}>a strategic plan</span>
        </h1>

        <p style={{ color: "#9ca3af", fontSize: "18px", fontWeight: 300 }}>
          3 AI agents work in sequence to analyse, enrich, and write your report
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        width: "100%", maxWidth: "680px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px", padding: "32px",
        backdropFilter: "blur(20px)",
        animation: "fadeUp 0.5s ease 0.2s both",
      }}>

        {!loading ? (
          <>
            <label style={{ color: "#d1d5db", fontSize: "14px", fontWeight: 500, display: "block", marginBottom: "12px" }}>
              Describe your problem or goal
            </label>

            <textarea
              value={problem}
              onChange={e => { setProblem(e.target.value); setError(""); }}
              placeholder="e.g. Build a creator marketplace platform where brands can connect with content creators..."
              rows={4}
              style={{
                width: "100%", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px",
                color: "#ffffff", fontSize: "16px", padding: "16px",
                resize: "none", outline: "none", fontFamily: "Inter, sans-serif",
                lineHeight: 1.6, marginBottom: "8px",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
            )}

            {/* Example pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              <span style={{ color: "#6b7280", fontSize: "12px", alignSelf: "center" }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => setProblem(ex)} style={{
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "100px", color: "#a5b4fc", fontSize: "12px",
                  padding: "4px 12px", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.target.style.background = "rgba(99,102,241,0.25)"}
                  onMouseLeave={e => e.target.style.background = "rgba(99,102,241,0.1)"}
                >
                  {ex}
                </button>
              ))}
            </div>

            <button onClick={handleGenerate} style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: "12px", color: "#ffffff",
              fontSize: "16px", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s", letterSpacing: "0.02em",
            }}
              onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >
              Generate Strategic Plan →
            </button>
          </>
        ) : (
          /* Loading State */
          <div style={{ padding: "20px 0" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "3px solid rgba(99,102,241,0.2)",
                borderTop: "3px solid #6366f1",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }} />
              <p style={{ color: "#d1d5db", fontSize: "16px", fontWeight: 500 }}>
                Agents are working on your plan...
              </p>
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
                This usually takes 15–30 seconds
              </p>
            </div>

            {/* Step indicators */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {STEPS.map(step => {
                const isDone = currentStep > step.id;
                const isActive = currentStep === step.id;
                return (
                  <div key={step.id} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "14px 16px", borderRadius: "10px",
                    background: isActive ? "rgba(99,102,241,0.15)" : isDone ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(99,102,241,0.3)" : isDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.4s",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isDone ? "#22c55e" : isActive ? "#6366f1" : "rgba(255,255,255,0.05)",
                      fontSize: "14px", fontWeight: 600, color: "#fff",
                      transition: "all 0.4s",
                    }}>
                      {isDone ? "✓" : step.id}
                    </div>
                    <div>
                      <p style={{ color: isActive ? "#c7d2fe" : isDone ? "#86efac" : "#6b7280", fontWeight: 500, fontSize: "14px" }}>
                        {step.label}
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "12px" }}>
                        {isActive ? step.desc : isDone ? "Completed" : "Waiting..."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ color: "#374151", fontSize: "13px", marginTop: "32px" }}>
        Powered by Gemini AI · 3-agent pipeline · Exports to DOCX & PDF
      </p>
    </main>
  );
}