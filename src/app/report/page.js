"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateReportById } from "@/lib/storage";

const SECTION_KEYS = ["problemBreakdown", "stakeholders", "solutionApproach", "actionPlan"];

const SECTION_META = {
  problemBreakdown: { number: "01", label: "Problem Breakdown", accent: "#7c6af7", bg: "rgba(124,106,247,0.06)" },
  stakeholders:     { number: "02", label: "Stakeholders",      accent: "#a78bfa", bg: "rgba(167,139,250,0.06)" },
  solutionApproach: { number: "03", label: "Solution Approach", accent: "#22d3ee", bg: "rgba(34,211,238,0.06)"  },
  actionPlan:       { number: "04", label: "Action Plan",       accent: "#4ade80", bg: "rgba(74,222,128,0.06)"  },
};

const EDIT_SUGGESTIONS = [
  "Make this more detailed",
  "Rewrite more professionally",
  "Shorten this section",
  "Make it more actionable",
  "Simplify the language",
];

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [exportLoading, setExportLoading] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("report");
    if (!stored) { router.push("/"); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  async function handleEdit(sectionKey) {
    if (!editInstruction.trim()) { setEditError("Enter an instruction."); return; }
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch("/api/agent/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: report.sections[sectionKey].title,
          currentContent: report.sections[sectionKey].content,
          editInstruction: editInstruction.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const updated = {
        ...report,
        sections: {
          ...report.sections,
          [sectionKey]: { ...report.sections[sectionKey], content: json.data.content },
        },
      };
      setReport(updated);
      sessionStorage.setItem("report", JSON.stringify(updated));
      const id = sessionStorage.getItem("currentReportId");
      if (id) updateReportById(id, updated);
      setEditing(null); setEditInstruction("");
      setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2500);
    } catch (err) {
      setEditError(err.message || "Edit failed.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleExport(format) {
    setExportLoading(format);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, format }),
      });
      if (format === "docx") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "planning-report.docx"; a.click();
        URL.revokeObjectURL(url);
      }
      if (format === "pdf") {
        const json = await res.json();
        const win = window.open("", "_blank");
        win.document.write(json.html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExportLoading("");
    }
  }

  if (!report) return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px",
          border: "2px solid var(--border-subtle)", borderTopColor: "var(--accent)",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading report...</p>
      </div>
    </div>
  );

  const date = new Date(report.generatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f7f6f3" }}>

      {/* Sticky Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,20,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="btn btn-ghost" onClick={() => router.push("/")} style={{
            padding: "6px 14px", fontSize: "13px",
          }}>
            ← Back
          </button>
          <span style={{ color: "var(--border-mid)", fontSize: "16px" }}>|</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            Strategic Plan Report
          </span>
          {savedMsg && (
            <span className="anim-fade-in" style={{
              fontSize: "12px", color: "#4ade80",
              padding: "4px 10px", borderRadius: "100px",
              background: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}>
              ✓ Saved
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost" onClick={() => handleExport("pdf")}
            disabled={!!exportLoading} style={{ fontSize: "13px", padding: "7px 16px" }}>
            {exportLoading === "pdf" ? "Exporting..." : "↓ PDF"}
          </button>
          <button className="btn btn-primary" onClick={() => handleExport("docx")}
            disabled={!!exportLoading} style={{ fontSize: "13px", padding: "7px 16px" }}>
            {exportLoading === "docx" ? "Exporting..." : "↓ DOCX"}
          </button>
        </div>
      </nav>

      {/* Report Header */}
      <div style={{
        background: "linear-gradient(160deg, #0a0a14 0%, #13131f 60%, #1a1830 100%)",
        padding: "clamp(48px, 8vw, 88px) 24px clamp(40px, 6vw, 72px)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: "60%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(124,106,247,0.4), transparent)",
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div className="anim-fade-up tag" style={{ marginBottom: "24px", display: "inline-flex" }}>
            AI STRATEGIC REPORT · {date}
          </div>

          <h1 className="display anim-fade-up delay-1" style={{
            fontSize: "clamp(26px, 5vw, 48px)",
            color: "#f0efe8", lineHeight: 1.2,
            letterSpacing: "-0.02em", marginBottom: "32px",
          }}>
            {report.problemStatement}
          </h1>

          {/* Metadata pills */}
          <div className="anim-fade-up delay-2" style={{
            display: "flex", justifyContent: "center",
            flexWrap: "wrap", gap: "10px",
          }}>
            {[
              { label: "Type", value: report.metadata?.problemType, color: "#7c6af7" },
              { label: "Complexity", value: report.metadata?.complexity, color: "#c9a84c" },
              { label: "Timeline", value: report.metadata?.estimatedTimeline, color: "#22d3ee" },
            ].filter(m => m.value).map(m => (
              <div key={m.label} style={{
                padding: "8px 18px", borderRadius: "100px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{m.label}: </span>
                <span style={{ color: m.color, fontSize: "13px", fontWeight: 600 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholder Cards */}
      {report.stakeholderList?.length > 0 && (
        <div style={{ maxWidth: "920px", margin: "0 auto", padding: "40px 24px 0" }}>
          <p style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
            color: "#9998b0", marginBottom: "16px", textTransform: "uppercase",
          }}>
            Key Stakeholders
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}>
            {report.stakeholderList.map((s, i) => {
              const colors = ["#7c6af7", "#a78bfa", "#22d3ee", "#4ade80"];
              const c = colors[i % colors.length];
              return (
                <div key={i} className="anim-fade-up" style={{
                  animationDelay: `${i * 0.08}s`,
                  background: "#ffffff",
                  border: "1px solid #ebebf0",
                  borderRadius: "var(--r-md)", padding: "20px",
                  borderTop: `3px solid ${c}`,
                }}>
                  <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a1828", marginBottom: "4px" }}>
                    {s.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#8b8a99", marginBottom: "10px" }}>
                    {s.role}
                  </p>
                  <p style={{ fontSize: "13px", color: "#4a4960", lineHeight: 1.6 }}>
                    {s.needs}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Sections */}
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {SECTION_KEYS.map((key, idx) => {
          const section = report.sections[key];
          const meta = SECTION_META[key];
          const isEditing = editing === key;
          if (!section) return null;

          return (
            <div key={key} className="anim-fade-up" style={{
              animationDelay: `${idx * 0.1}s`,
              background: "#ffffff",
              border: "1px solid #ebebf0",
              borderRadius: "var(--r-lg)",
              overflow: "hidden", marginBottom: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"}
            >
              {/* Section header */}
              <div style={{
                padding: "22px 28px",
                background: meta.bg,
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap", gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: meta.accent + "20",
                    border: `1px solid ${meta.accent}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, color: meta.accent,
                    flexShrink: 0,
                  }}>
                    {meta.number}
                  </span>
                  <h2 className="display" style={{
                    fontSize: "clamp(18px, 3vw, 24px)",
                    color: "#1a1828", fontWeight: 400,
                  }}>
                    {section.title}
                  </h2>
                </div>

                <button onClick={() => {
                  setEditing(isEditing ? null : key);
                  setEditInstruction(""); setEditError("");
                }} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "var(--r-sm)",
                  border: `1px solid ${isEditing ? "#d1d5db" : meta.accent + "40"}`,
                  background: isEditing ? "#f9fafb" : meta.accent + "10",
                  color: isEditing ? "#6b7280" : meta.accent,
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s", fontFamily: "'Syne', sans-serif",
                }}>
                  {isEditing ? "✕ Cancel" : "✏ Edit with AI"}
                </button>
              </div>

              {/* Section content */}
              <div style={{ padding: "28px 32px" }}>
                {String(section.content ?? "").split("\n").filter(p => p.trim()).map((para, i) => (
                  <p key={i} style={{
                    fontSize: "15px", lineHeight: 1.85,
                    color: "#374151", marginBottom: "16px",
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="anim-fade-up" style={{
                  padding: "20px 28px 24px",
                  borderTop: "1px solid #f0f0f5",
                  background: "#fafafa",
                }}>
                  <p style={{
                    fontSize: "12px", fontWeight: 600, letterSpacing: "0.07em",
                    color: "#9998b0", textTransform: "uppercase", marginBottom: "12px",
                  }}>
                    How should AI edit this?
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                    {EDIT_SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => setEditInstruction(s)} style={{
                        padding: "5px 12px", borderRadius: "100px", fontSize: "12px",
                        border: "1px solid #e5e7eb", fontFamily: "'Syne', sans-serif",
                        background: editInstruction === s ? meta.accent + "12" : "#fff",
                        color: editInstruction === s ? meta.accent : "#6b7280",
                        cursor: "pointer", transition: "all 0.15s",
                        borderColor: editInstruction === s ? meta.accent + "40" : "#e5e7eb",
                      }}>
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="stack-mobile" style={{ display: "flex", gap: "10px" }}>
                    <input
                      value={editInstruction}
                      onChange={e => { setEditInstruction(e.target.value); setEditError(""); }}
                      placeholder="Or describe your own edit..."
                      onKeyDown={e => e.key === "Enter" && handleEdit(key)}
                      style={{
                        flex: 1, padding: "10px 14px",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px", outline: "none",
                        fontFamily: "'Syne', sans-serif",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = meta.accent}
                      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                    />
                    <button onClick={() => handleEdit(key)} disabled={editLoading} className="full-mobile" style={{
                      padding: "10px 22px", borderRadius: "var(--r-sm)",
                      background: meta.accent, color: "#fff", border: "none",
                      fontSize: "14px", fontWeight: 500, cursor: editLoading ? "not-allowed" : "pointer",
                      opacity: editLoading ? 0.7 : 1, fontFamily: "'Syne', sans-serif",
                      transition: "all 0.2s", whiteSpace: "nowrap",
                    }}>
                      {editLoading ? "Editing..." : "Apply →"}
                    </button>
                  </div>
                  {editError && (
                    <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{editError}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Risks + Metrics */}
        <div className="stack-mobile" style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
          <div style={{
            flex: 1, background: "#fff", border: "1px solid #fecaca",
            borderRadius: "var(--r-lg)", padding: "24px",
            borderTop: "3px solid #ef4444",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#dc2626", marginBottom: "16px", letterSpacing: "0.06em" }}>
              ⚠ KEY RISKS
            </p>
            {report.metadata?.keyRisks?.map((r, i) => (
              <div key={i} style={{
                padding: "10px 14px", background: "#fff5f5",
                borderRadius: "var(--r-sm)", marginBottom: "8px",
                fontSize: "13px", color: "#374151", lineHeight: 1.6,
                borderLeft: "3px solid #fca5a5",
              }}>
                {r}
              </div>
            ))}
          </div>

          <div style={{
            flex: 1, background: "#fff", border: "1px solid #bbf7d0",
            borderRadius: "var(--r-lg)", padding: "24px",
            borderTop: "3px solid #22c55e",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#16a34a", marginBottom: "16px", letterSpacing: "0.06em" }}>
              ✓ SUCCESS METRICS
            </p>
            {report.metadata?.successMetrics?.map((m, i) => (
              <div key={i} style={{
                padding: "10px 14px", background: "#f0fdf4",
                borderRadius: "var(--r-sm)", marginBottom: "8px",
                fontSize: "13px", color: "#374151", lineHeight: 1.6,
                borderLeft: "3px solid #86efac",
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}