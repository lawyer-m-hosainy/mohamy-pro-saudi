import { Deadline } from "@/types";
import { CasesRepository } from "@/repositories/casesRepository";
import { assertDeadlineDate, canTransitionCaseStatus, mapCaseStatusToStage } from "@/domain/legalWorkflow";

export interface DeadlineInput {
  caseId: string;
  title: string;
  date: string;
  type: Deadline["type"];
  priority: Deadline["priority"];
}

export function linkCaseToNajiz(repository: CasesRepository, caseId: string) {
  const cases = repository.getCases();
  const updatedCases = cases.map((c) =>
    c.id === caseId ? { ...c, najizReferenceStatus: "مربوط بناجز" as const, workflowStage: mapCaseStatusToStage(c.status) } : c
  );
  repository.saveCases(updatedCases);
}

export function addCaseMemorandum(repository: CasesRepository, caseId: string, memorandumName: string) {
  const cases = repository.getCases();
  const updatedCases = cases.map((c) =>
    c.id === caseId ? { ...c, memorandums: [...c.memorandums, memorandumName], workflowStage: "pleadings" as const } : c
  );
  repository.saveCases(updatedCases);
}

export function createDeadline(input: DeadlineInput): Deadline {
  assertDeadlineDate(input.date);
  return {
    id: `D-${Date.now()}`,
    caseId: input.caseId,
    title: input.title,
    date: input.date,
    type: input.type,
    status: "pending",
    priority: input.priority,
  };
}

export function addDeadlineToCase(repository: CasesRepository, input: DeadlineInput) {
  const deadline = createDeadline(input);
  repository.addDeadline(deadline);
}

export function transitionCaseStatus(repository: CasesRepository, caseId: string, nextStatus: "نشطة" | "مغلقة" | "تحت الدراسة") {
  const cases = repository.getCases();
  const updated = cases.map((c) => {
    if (c.id !== caseId) return c;
    if (!canTransitionCaseStatus(c.status, nextStatus)) {
      throw new Error("INVALID_CASE_STATUS_TRANSITION");
    }
    return {
      ...c,
      status: nextStatus,
      workflowStage: mapCaseStatusToStage(nextStatus),
    };
  });
  repository.saveCases(updated);
}
