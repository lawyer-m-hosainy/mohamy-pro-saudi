import { motion } from "motion/react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, FileSearch, Bell } from "lucide-react";
import { useComplianceStore } from '@/store/useComplianceStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

function sevClass(sev: "High" | "Medium" | "Low") {
  if (sev === "High") return "bg-destructive/10 text-destructive";
  if (sev === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function GRC() {
  const riskRegisters = useComplianceStore((state) => state.riskRegisters);
  const controls = useComplianceStore((state) => state.controls);
  const complianceIssues = useComplianceStore((state) => state.complianceIssues);
  const regulatoryObligations = useComplianceStore((state) => state.regulatoryObligations);
  const updateRiskStatus = useComplianceStore((state) => state.updateRiskStatus);
  const updateComplianceIssueStatus = useComplianceStore((state) => state.updateComplianceIssueStatus);
  const addAuditLog = useUIStore((state) => state.addAuditLog);
  const currentUser = useAuthStore((state) => state.currentUser);

  const heatmap = useMemo(() => {
    const high = riskRegisters.filter((r) => r.severity === "High").length;
    const medium = riskRegisters.filter((r) => r.severity === "Medium").length;
    const low = riskRegisters.filter((r) => r.severity === "Low").length;
    return { high, medium, low };
  }, [riskRegisters]);

  const log = (action: string, details: string) => {
    addAuditLog({
      id: `AL-GRC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUser?.id || "unknown",
      userName: currentUser?.name || "unknown",
      action,
      module: "grc",
      details,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الحوكمة والامتثال (GRC)</h1>
          <p className="text-slate-500 mt-1">متابعة المخاطر والضوابط وقضايا الامتثال والالتزامات التنظيمية.</p>
        </div>
        <Badge className="bg-primary-100 text-primary-700">Security First</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-sm">Risk Heatmap - High</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-destructive">{heatmap.high}</p></CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-sm">Risk Heatmap - Medium</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-600">{heatmap.medium}</p></CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-sm">Risk Heatmap - Low</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-emerald-600">{heatmap.low}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle size={16} /> سجل المخاطر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskRegisters.map((r) => (
              <div key={r.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{r.title}</p>
                  <Badge className={sevClass(r.severity)}>{r.severity}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{r.category} • المالك: {r.ownerId}</p>
                <p className="text-xs mt-2">{r.mitigationPlan}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { updateRiskStatus(r.id, "قيد المعالجة"); log("Risk Status Update", `Risk ${r.id} -> قيد المعالجة`); }}>قيد المعالجة</Button>
                  <Button size="sm" variant="outline" onClick={() => { updateRiskStatus(r.id, "مغلق"); log("Risk Status Update", `Risk ${r.id} -> مغلق`); }}>إغلاق</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldCheck size={16} /> Controls Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {controls.map((c) => (
              <div key={c.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{c.title}</p>
                  <Badge className={c.status === "فعال" ? "bg-emerald-100 text-emerald-700" : c.status === "بحاجة تحسين" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.controlType} • {c.frequency} • آخر مراجعة: {c.lastReviewAt || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileSearch size={16} /> Issue Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceIssues.map((i) => (
              <div key={i.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{i.title}</p>
                  <Badge className={sevClass(i.severity)}>{i.severity}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">الحالة: {i.status} • الاستحقاق: {i.dueDate || "-"}</p>
                <p className="text-xs mt-2">{i.description}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { updateComplianceIssueStatus(i.id, "قيد المعالجة"); log("Compliance Issue Update", `Issue ${i.id} -> قيد المعالجة`); }}>قيد المعالجة</Button>
                  <Button size="sm" variant="outline" onClick={() => { updateComplianceIssueStatus(i.id, "مغلق"); log("Compliance Issue Update", `Issue ${i.id} -> مغلق`); }}>إغلاق</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell size={16} /> الالتزامات التنظيمية والتنبيهات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regulatoryObligations.map((o) => (
              <div key={o.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{o.title}</p>
                  <Badge className={o.status === "ملتزم" ? "bg-emerald-100 text-emerald-700" : o.status === "قريب الاستحقاق" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}>
                    {o.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{o.regulator} • الاستحقاق: {o.dueDate}</p>
                {o.notes && <p className="text-xs mt-2">{o.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
