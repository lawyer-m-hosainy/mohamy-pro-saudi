import { Case, Deadline } from "@/types";

export type CaseWorkflowStage = "intake" | "pleadings" | "hearing" | "judgment" | "closed";

// Was keyed on "نشطة", which is not a value Case["status"] (src/types/case.ts)
// or schema.sql's check constraint ever allow — only متداولة/تحت الدراسة/
// مغلقة/محفوظة are valid. Every lookup here silently fell through to
// `undefined` and `.includes()` on it would have thrown; the only reason
// this shipped was that these functions are only reachable via test-only
// helpers today. "متداولة" ("in progress/circulating") is the real
// equivalent of the intended "active" status.
const allowedStatusTransitions: Record<Case["status"], Case["status"][]> = {
  "تحت الدراسة": ["متداولة", "مغلقة"],
  "متداولة": ["مغلقة", "محفوظة"],
  "مغلقة": ["محفوظة"],
  "محفوظة": [],
};

export function canTransitionCaseStatus(from: Case["status"], to: Case["status"]) {
  return from === to || allowedStatusTransitions[from].includes(to);
}

export function mapCaseStatusToStage(status: Case["status"]): CaseWorkflowStage {
  if (status === "تحت الدراسة") return "intake";
  if (status === "متداولة") return "hearing";
  return "closed";
}

export function assertDeadlineDate(date: string) {
  const selected = new Date(date);
  if (Number.isNaN(selected.getTime())) {
    throw new Error("INVALID_DEADLINE_DATE");
  }

  const now = new Date();
  const selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (selectedDay < today) {
    throw new Error("PAST_DEADLINE_NOT_ALLOWED");
  }
}

export function enrichDeadlineStatuses(deadlines: Deadline[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return deadlines.map((d) => {
    const dd = new Date(d.date);
    const day = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate());
    if (d.status === "completed") return d;
    if (!Number.isNaN(dd.getTime()) && day < today) {
      return { ...d, status: "overdue" as const };
    }
    return d;
  });
}
