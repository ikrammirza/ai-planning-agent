"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SECTION_KEYS = ["problemBreakdown", "stakeholders", "solutionApproach", "actionPlan"];

const SECTION_META = {
  problemBreakdown:  { number: "01", color: "#6366f1", light: "rgba(99,102,241,0.08)"  },
  stakeholders:      { number: "02", color: "#8b5cf6", light: "rgba(139,92,246,0.08)"  },
  solutionApproach:  { number: "03", color: "#06b6d4", light: "rgba(6,182,212,0.08)"   },
  actionPlan:        { number: "04", color: "#10b981", light: "rgba(16,185,129,0.08)"  },
};

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [exportLoading, setExportLoading] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("report");
    if (!stored) { router.push("/"); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  async function handleEdit(sectionKey) {
    if (!editInstruction.trim()) {
      setEditError("Please enter an edit instruction.");
      return;
    }
    setEditLoading(true);
    setEditError("");

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

      // Update just this section in the report
      const updated = {
        ...report,
        sections: {
          ...report.sections,
          [sectionKey]: {
            ...report.sections[sectionKey],
            content: json.data.content,
          },
        },
      };
      setReport(updated);
      sessionStorage.setItem("report", JSON.stringify(updated));
      setEditing(null);
      setEditInstruction("");
    } catch (err) {
      setEditError(err.message || "Edit failed. Try again.");
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
        a.href = url;
        a.download = "planning-report.docx";
        a.click();
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

  if (!report) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8ff" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8ff" }}>

      {/* Top Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.push("/")} style={{
            background: "none", border: "1px solid #e5e7eb", borderRadius: "8px",
            padding: "6px 14px", cursor: "pointer", fontSize: "13px", color: "#6b7280",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            ← Back
          </button>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
            Strategic Plan Report
          </span>
        </div>

        {/* Export buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => handleExport("pdf")} disabled={!!exportLoading} style={{
            padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
            border: "1px solid #e5e7eb", background: "#fff", color: "#374151",
            cursor: exportLoading ? "not-allowed" : "pointer", opacity: exportLoading ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {exportLoading === "pdf" ? "..." : "⬇ PDF"}
          </button>
          <button onClick={() => handleExport("docx")} disabled={!!exportLoading} style={{
            padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
            border: "none", background: "#6366f1", color: "#fff",
            cursor: exportLoading ? "not-allowed" : "pointer", opacity: exportLoading ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {exportLoading === "docx" ? "..." : "⬇ DOCX"}
          </button>
        </div>
      </nav>

      {/* Report Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f23, #1a1a3e)",
        padding: "60px 32px", textAlign: "center",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(99,102,241,0.2)",
          border: "1px solid rgba(99,102,241,0.3)", borderRadius: "100px",
          padding: "6px 18px", marginBottom: "20px",
        }}>
          <span style={{ color: "#818cf8", fontSize: "12px", letterSpacing: "0.1em" }}>
            AI STRATEGIC PLANNING REPORT
          </span>
        </div>

        <h1 className="font-serif" style={{
          color: "#ffffff", fontSize: "clamp(24px, 4vw, 42px)",
          maxWidth: "700px", margin: "0 auto 16px", lineHeight: 1.3,
        }}>
          {report.problemStatement}
        </h1>

        {/* Metadata pills */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginTop: "24px" }}>
          {[
            { label: "Type", value: report.metadata?.problemType },
            { label: "Complexity", value: report.metadata?.complexity },
            { label: "Timeline", value: report.metadata?.estimatedTimeline },
          ].map(m => m.value && (
            <div key={m.label} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px", padding: "8px 16px",
            }}>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>{m.label}: </span>
              <span style={{ color: "#e5e7eb", fontSize: "13px", fontWeight: 500 }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stakeholder Cards */}
      {report.stakeholderList?.length > 0 && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {report.stakeholderList.map((s, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
                padding: "20px", animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", marginBottom: "12px",
                  background: ["rgba(99,102,241,0.1)", "rgba(139,92,246,0.1)", "rgba(6,182,212,0.1)"][i % 3],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px",
                }}>
                  {["👤", "🏢", "⚙️", "📊"][i % 4]}
                </div>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e", marginBottom: "4px" }}>{s.name}</p>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>{s.role}</p>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>{s.needs}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Sections */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {SECTION_KEYS.map((key, idx) => {
          const section = report.sections[key];
          const meta = SECTION_META[key];
          const isEditing = editing === key;
          if (!section) return null;

          return (
            <div key={key} style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px",
              overflow: "hidden", marginBottom: "24px",
              animation: `fadeUp 0.4s ease ${idx * 0.1}s both`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              {/* Section Header */}
              <div style={{
                padding: "24px 28px", borderBottom: "1px solid #f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: meta.light,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: meta.color,
                    letterSpacing: "0.12em", opacity: 0.8,
                  }}>
                    {meta.number}
                  </span>
                  <h2 className="font-serif" style={{ fontSize: "22px", color: "#1a1a2e" }}>
                    {section.title}
                  </h2>
                </div>

                <button onClick={() => {
                  setEditing(isEditing ? null : key);
                  setEditInstruction("");
                  setEditError("");
                }} style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                  border: `1px solid ${isEditing ? "#e5e7eb" : meta.color}`,
                  background: isEditing ? "#f9fafb" : "transparent",
                  color: isEditing ? "#6b7280" : meta.color,
                  cursor: "pointer", fontWeight: 500,
                  transition: "all 0.2s",
                }}>
                  {isEditing ? "Cancel" : "✏ Edit with AI"}
                </button>
              </div>

              {/* Section Content */}
              <div style={{ padding: "28px" }}>
                {section.content.split("\n").filter(p => p.trim()).map((para, i) => (
                  <p key={i} style={{
                    fontSize: "15px", lineHeight: 1.8, color: "#374151",
                    marginBottom: "14px",
                  }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Edit Panel */}
              {isEditing && (
                <div style={{
                  padding: "20px 28px", borderTop: "1px solid #f3f4f6",
                  background: "#fafafa",
                }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px", fontWeight: 500 }}>
                    How should AI edit this section?
                  </p>

                  {/* Quick instruction pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                    {[
                      "Make this more detailed",
                      "Rewrite in a more professional tone",
                      "Shorten this section",
                      "Make this more actionable",
                      "Simplify the language",
                    ].map(suggestion => (
                      <button key={suggestion} onClick={() => setEditInstruction(suggestion)} style={{
                        padding: "4px 12px", borderRadius: "100px", fontSize: "12px",
                        border: "1px solid #e5e7eb", background: editInstruction === suggestion ? meta.light : "#fff",
                        color: editInstruction === suggestion ? meta.color : "#6b7280",
                        cursor: "pointer", transition: "all 0.2s",
                      }}>
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      value={editInstruction}
                      onChange={e => { setEditInstruction(e.target.value); setEditError(""); }}
                      placeholder="Or type your own instruction..."
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", fontSize: "14px",
                        outline: "none", fontFamily: "Inter, sans-serif",
                      }}
                      onKeyDown={e => e.key === "Enter" && handleEdit(key)}
                    />
                    <button onClick={() => handleEdit(key)} disabled={editLoading} style={{
                      padding: "10px 20px", borderRadius: "8px", fontSize: "14px",
                      background: meta.color, color: "#fff", border: "none",
                      cursor: editLoading ? "not-allowed" : "pointer",
                      fontWeight: 500, opacity: editLoading ? 0.7 : 1,
                      whiteSpace: "nowrap",
                    }}>
                      {editLoading ? "Editing..." : "Apply →"}
                    </button>
                  </div>
                  {editError && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{editError}</p>}
                </div>
              )}
            </div>
          );
        })}

        {/* Key Risks + Success Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "8px" }}>
          {/* Risks */}
          <div style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#dc2626", marginBottom: "16px" }}>
              ⚠ Key Risks
            </h3>
            {report.metadata?.keyRisks?.map((r, i) => (
              <div key={i} style={{
                padding: "10px 14px", background: "#fff5f5", borderRadius: "8px",
                marginBottom: "8px", fontSize: "13px", color: "#374151", lineHeight: 1.5,
              }}>
                {r}
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#16a34a", marginBottom: "16px" }}>
              ✓ Success Metrics
            </h3>
            {report.metadata?.successMetrics?.map((m, i) => (
              <div key={i} style={{
                padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px",
                marginBottom: "8px", fontSize: "13px", color: "#374151", lineHeight: 1.5,
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