const REPORTS_KEY = "ai_planner_reports";
const MAX_SAVED = 10;

export function saveReport(report) {
  try {
    const existing = getSavedReports();
    const newEntry = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      problemStatement: report.problemStatement,
      report,
    };
    // Add to front, keep max 10
    const updated = [newEntry, ...existing].slice(0, MAX_SAVED);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return newEntry.id;
  } catch (e) {
    console.error("Failed to save report:", e);
    return null;
  }
}

export function getSavedReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getReportById(id) {
  try {
    const all = getSavedReports();
    return all.find(r => r.id === id) || null;
  } catch (e) {
    return null;
  }
}

export function deleteReport(id) {
  try {
    const all = getSavedReports();
    const updated = all.filter(r => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete report:", e);
  }
}

export function updateReportById(id, updatedReport) {
  try {
    const all = getSavedReports();
    const updated = all.map(r =>
      r.id === id ? { ...r, report: updatedReport } : r
    );
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update report:", e);
  }
}