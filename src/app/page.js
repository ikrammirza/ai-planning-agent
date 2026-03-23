"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveReport, getSavedReports, deleteReport } from "@/lib/storage";

const STEPS = [
  { id: 1, label: "Planner Agent", desc: "Breaking down your problem into components..." },
  { id: 2, label: "Insight Agent", desc: "Enriching with context, risks & stakeholders..." },
  { id: 3, label: "Execution Agent", desc: "Writing your full strategic report..." },
];

const EXAMPLES = [
  "Build a creator marketplace platform",
  "Launch a SaaS for small restaurants",
  "Create an online coding bootcamp",
  "Build a healthcare booking system",
];

export default function Home() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSavedReports(getSavedReports());
  }, []);

  async function handleGenerate() {
    if (!problem.trim()) { setError("Please enter a problem statement."); return; }
    setError(""); setLoading(true); setCurrentStep(1);
    try {
      const t1 = setTimeout(() => setCurrentStep(2), 4000);
      const t2 = setTimeout(() => setCurrentStep(3), 9000);
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problem.trim() }),
      });
      clearTimeout(t1); clearTimeout(t2);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      const json = await res.json();
      const id = saveReport(json.data);
      sessionStorage.setItem("currentReportId", id);
      sessionStorage.setItem("report", JSON.stringify(json.data));
      router.push("/report");
    } catch (err) {
      setError(err.message || "Failed to generate. Please try again.");
      setLoading(false); setCurrentStep(0);
    }
  }

  function openSaved(entry) {
    sessionStorage.setItem("currentReportId", entry.id);
    sessionStorage.setItem("report", JSON.stringify(entry.report));
    router.push("/report");
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteReport(id);
    setSavedReports(getSavedReports());
  }

  function timeAgo(iso) {
    const d = Date.now() - new Date(iso).getTime();
    const m = Math.floor(d / 60000), h = Math.floor(d / 3600000), day = Math.floor(d / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${day}d ago`;
  }

  return (
    <div className="grain" style={{ minHeight: "100vh", background: "var(--ink)", position: "relative", overflow: "hidden" }}>

      {/* Background orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%",
        width: "60vw", height: "60vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "50vw", height: "50vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <main style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 20px",
      }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "52px", maxWidth: "700px" }}>
          <div className="anim-fade-up tag" style={{ marginBottom: "28px", display: "inline-flex" }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)", display: "inline-block",
              marginRight: 8, animation: "pulse-soft 2s infinite",
            }} />
            AI PLANNING AGENT
          </div>

          <h1 className="display anim-fade-up delay-1" style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: 1.1, marginBottom: "20px",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            Transform any problem<br />
            <span className="display-italic" style={{ color: "var(--accent-2)" }}>
              into a strategic plan
            </span>
          </h1>

          <p className="anim-fade-up delay-2" style={{
            color: "var(--text-secondary)", fontSize: "18px",
            fontWeight: 300, lineHeight: 1.7,
          }}>
            Three specialised AI agents analyse, enrich, and write<br className="hide-mobile" />
            a structured execution report for any challenge.
          </p>
        </div>

        {/* Input card */}
        <div className="glass-strong anim-fade-up delay-3" style={{
          width: "100%", maxWidth: "660px",
          borderRadius: "var(--r-xl)", padding: "36px",
          marginBottom: "20px",
        }}>
          {!loading ? (
            <>
              <label style={{
                display: "block", fontSize: "12px", fontWeight: 500,
                letterSpacing: "0.08em", color: "var(--text-muted)",
                textTransform: "uppercase", marginBottom: "12px",
              }}>
                Your problem or goal
              </label>

              <textarea
                value={problem}
                onChange={e => { setProblem(e.target.value); setError(""); }}
                placeholder="e.g. Build a creator marketplace where brands connect with content creators for paid campaigns..."
                rows={4}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--r-md)", color: "var(--text-primary)",
                  fontSize: "15px", padding: "16px 18px",
                  resize: "none", outline: "none",
                  fontFamily: "'Syne', sans-serif", lineHeight: 1.7,
                  marginBottom: "4px", transition: "border-color 0.25s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(124,106,247,0.5)"}
                onBlur={e => e.target.style.borderColor = "var(--border-subtle)"}
              />

              {error && (
                <p style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
              )}

              {/* Example pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "16px 0 24px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", alignSelf: "center", marginRight: "2px" }}>
                  TRY:
                </span>
                {EXAMPLES.map(ex => (
                  <button key={ex} className="btn" onClick={() => setProblem(ex)} style={{
                    padding: "5px 13px", fontSize: "12px",
                    background: "rgba(124,106,247,0.08)",
                    border: "1px solid rgba(124,106,247,0.18)",
                    color: "var(--accent-2)", borderRadius: "100px",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,106,247,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(124,106,247,0.08)"}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleGenerate} style={{
                width: "100%", justifyContent: "center",
                padding: "15px", fontSize: "15px", fontWeight: 600,
                borderRadius: "var(--r-md)", letterSpacing: "0.02em",
              }}>
                Generate Strategic Plan
                <span style={{ fontSize: "18px", lineHeight: 1 }}>→</span>
              </button>
            </>
          ) : (
            /* Loading */
            <div>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 20px" }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "2px solid var(--border-subtle)",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: "var(--accent)",
                    animation: "spin 1s linear infinite",
                  }} />
                  <div style={{
                    position: "absolute", inset: "8px", borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: "var(--gold)",
                    animation: "spin 1.5s linear infinite reverse",
                  }} />
                </div>
                <p style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 500 }}>
                  Agents are building your plan
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
                  Usually takes 15–30 seconds
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {STEPS.map(step => {
                  const done = currentStep > step.id;
                  const active = currentStep === step.id;
                  return (
                    <div key={step.id} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 16px", borderRadius: "var(--r-md)",
                      background: active ? "rgba(124,106,247,0.12)" : done ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${active ? "rgba(124,106,247,0.3)" : done ? "rgba(74,222,128,0.2)" : "var(--border-subtle)"}`,
                      transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? "rgba(74,222,128,0.2)" : active ? "rgba(124,106,247,0.3)" : "rgba(255,255,255,0.04)",
                        color: done ? "#4ade80" : active ? "var(--accent-2)" : "var(--text-muted)",
                        fontSize: "13px", fontWeight: 600, transition: "all 0.5s",
                        border: `1px solid ${done ? "rgba(74,222,128,0.3)" : active ? "rgba(124,106,247,0.4)" : "var(--border-subtle)"}`,
                      }}>
                        {done ? "✓" : step.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: "14px", fontWeight: 500,
                          color: done ? "#4ade80" : active ? "var(--accent-2)" : "var(--text-muted)",
                          transition: "color 0.4s",
                        }}>
                          {step.label}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {active ? step.desc : done ? "Completed" : "Waiting..."}
                        </p>
                      </div>
                      {active && (
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "var(--accent)", flexShrink: 0,
                          animation: "pulse-soft 1s infinite",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Agent pills */}
        {!loading && (
          <div className="anim-fade-up delay-4" style={{
            display: "flex", gap: "12px", flexWrap: "wrap",
            justifyContent: "center", marginBottom: "48px",
          }}>
            {["🔍 Planner", "💡 Insight", "✍️ Executor"].map(a => (
              <div key={a} style={{
                padding: "8px 16px", borderRadius: "100px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px", color: "var(--text-secondary)",
              }}>
                {a}
              </div>
            ))}
            <div style={{
              padding: "8px 16px", borderRadius: "100px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              fontSize: "13px", color: "var(--text-secondary)",
            }}>
              📄 DOCX + PDF Export
            </div>
          </div>
        )}

        {/* Saved reports */}
        {mounted && savedReports.length > 0 && !loading && (
          <div className="anim-fade-up delay-5" style={{ width: "100%", maxWidth: "660px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              marginBottom: "14px",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 500 }}>
                RECENT REPORTS
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {savedReports.slice(0, 5).map((entry, i) => (
                <div key={entry.id} onClick={() => openSaved(entry)}
                  className="anim-slide-in"
                  style={{
                    animationDelay: `${0.5 + i * 0.06}s`,
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 18px", borderRadius: "var(--r-md)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(124,106,247,0.08)";
                    e.currentTarget.style.borderColor = "rgba(124,106,247,0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: "rgba(124,106,247,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                  }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "14px", fontWeight: 500, color: "var(--text-primary)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {entry.problemStatement}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {timeAgo(entry.savedAt)}
                    </p>
                  </div>
                  <button onClick={e => handleDelete(e, entry.id)} style={{
                    background: "none", border: "none", color: "var(--text-muted)",
                    cursor: "pointer", fontSize: "14px", padding: "4px 8px",
                    borderRadius: "var(--r-sm)", transition: "all 0.2s", flexShrink: 0,
                  }}
                    onMouseEnter={e => { e.target.style.color = "var(--danger)"; e.target.style.background = "rgba(248,113,113,0.1)"; }}
                    onMouseLeave={e => { e.target.style.color = "var(--text-muted)"; e.target.style.background = "none"; }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="anim-fade-up delay-6" style={{
          color: "var(--text-muted)", fontSize: "12px",
          marginTop: "48px", letterSpacing: "0.04em",
        }}>
          Powered by Groq · Llama 3.3 70B · 3-agent pipeline
        </p>
      </main>
    </div>
  );
}