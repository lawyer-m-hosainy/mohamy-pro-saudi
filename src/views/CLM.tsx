import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BellRing, FileDiff, FileSignature, GitCompare, RefreshCw } from "lucide-react";
import { useCLMStore } from '@/store/useCLMStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

function stageColor(stage: string) {
  if (stage === "طلب") return "bg-slate-100 text-slate-700";
  if (stage === "تفاوض") return "bg-blue-100 text-blue-700";
  if (stage === "مراجعة") return "bg-amber-100 text-amber-700";
  if (stage === "اعتماد") return "bg-purple-100 text-purple-700";
  if (stage === "توقيع") return "bg-emerald-100 text-emerald-700";
  if (stage === "متابعة التزامات") return "bg-indigo-100 text-indigo-700";
  return "bg-orange-100 text-orange-700";
}

export default function CLM() {
  const contractRequests = useCLMStore((state) => state.contractRequests);
  const currentUser = useAuthStore((state) => state.currentUser);
  const addContractVersion = useCLMStore((state) => state.addContractVersion);
  const updateContractStage = useCLMStore((state) => state.updateContractStage);
  const decideContractApproval = useCLMStore((state) => state.decideContractApproval);
  const updateContractObligationStatus = useCLMStore((state) => state.updateContractObligationStatus);
  const addAuditLog = useUIStore((state) => state.addAuditLog);
  const [selectedId, setSelectedId] = useState<string | null>(contractRequests[0]?.id || null);
  const [newVersionContent, setNewVersionContent] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  const selected = contractRequests.find((c) => c.id === selectedId) || contractRequests[0];

  const renewalAlerts = useMemo(() => {
    const now = Date.now();
    return contractRequests.filter((c) => {
      if (!c.renewalDate) return false;
      const diff = new Date(c.renewalDate).getTime() - now;
      return diff <= 30 * 24 * 60 * 60 * 1000;
    });
  }, [contractRequests]);

  const addVersion = () => {
    if (!selected || !newVersionContent.trim()) return;
    const nextVersion = (selected.versions[selected.versions.length - 1]?.versionNumber || 0) + 1;
    addContractVersion(selected.id, {
      id: `CV-${Date.now()}`,
      requestId: selected.id,
      versionNumber: nextVersion,
      content: newVersionContent.trim(),
      createdBy: currentUser?.id || "unknown",
      createdAt: new Date().toISOString(),
      changeSummary: changeSummary || "تحديث عام",
    });
    addAuditLog({
      id: `AL-CLM-V-${Date.now()}`,
      userId: currentUser?.id || "unknown",
      userName: currentUser?.name || "unknown",
      action: "Add Contract Version",
      module: "clm",
      details: `Added version ${nextVersion} for ${selected.id}`,
      timestamp: new Date().toISOString(),
    });
    setNewVersionContent("");
    setChangeSummary("");
    toast.success("تم إنشاء نسخة جديدة من العقد");
  };

  const comparePreview = () => {
    if (!selected || selected.versions.length < 2) {
      toast.error("لا توجد نسختان للمقارنة");
      return;
    }
    const a = selected.versions[selected.versions.length - 2];
    const b = selected.versions[selected.versions.length - 1];
    const msg = `مقارنة بين v${a.versionNumber} و v${b.versionNumber}: ${b.changeSummary || "بدون وصف تغييرات"}`;
    toast.success(msg);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة دورة حياة العقود (CLM)</h1>
          <p className="text-slate-500 mt-1">من الطلب وحتى الاعتماد والتوقيع ومتابعة الالتزامات والتجديد.</p>
        </div>
        <Badge className="bg-primary-100 text-primary-700">CLM</Badge>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BellRing size={16} /> تنبيهات التجديد والالتزامات</CardTitle>
        </CardHeader>
        <CardContent>
          {renewalAlerts.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد عقود قريبة التجديد خلال 30 يوم.</p>
          ) : (
            <div className="space-y-2">
              {renewalAlerts.map((c) => (
                <div key={c.id} className="p-2 rounded-md bg-amber-50 text-amber-700 text-sm">
                  العقد {c.id} ({c.title}) قريب التجديد بتاريخ {c.renewalDate}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-navy-800">
          <CardHeader><CardTitle className="text-base">طلبات العقود</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {contractRequests.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="w-full text-start p-3 border rounded-md hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary-700">{c.id}</p>
                  <Badge className={stageColor(c.stage)}>{c.stage}</Badge>
                </div>
                <p className="text-sm mt-1">{c.title}</p>
                <p className="text-xs text-slate-500 mt-1">{c.clientName}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">إدارة النسخ والاعتماد</CardTitle>
            {selected && <Badge className={stageColor(selected.stage)}>{selected.stage}</Badge>}
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-slate-500">لا يوجد عقد محدد.</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "تفاوض")}>تفاوض</Button>
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "مراجعة")}>مراجعة</Button>
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "اعتماد")}>اعتماد</Button>
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "توقيع")}><FileSignature size={14} className="ms-1" />توقيع</Button>
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "متابعة التزامات")}>متابعة التزامات</Button>
                  <Button size="sm" variant="outline" onClick={() => updateContractStage(selected.id, "تجديد/إنهاء")}><RefreshCw size={14} className="ms-1" />تجديد/إنهاء</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><FileDiff size={16} /> الإصدارات</h3>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {selected.versions.map((v) => (
                        <div key={v.id} className="p-2 rounded bg-slate-50">
                          <p className="text-sm font-bold">v{v.versionNumber}</p>
                          <p className="text-xs text-slate-500">{v.changeSummary || "-"}</p>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={comparePreview}><GitCompare size={14} /> مقارنة آخر نسختين</Button>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-bold mb-2">إنشاء نسخة جديدة</h3>
                    <Input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} placeholder="ملخص التغييرات" className="mb-2" />
                    <Textarea value={newVersionContent} onChange={(e) => setNewVersionContent(e.target.value)} placeholder="نص النسخة الجديدة..." className="min-h-[110px]" />
                    <Button size="sm" className="mt-2" onClick={addVersion}>حفظ نسخة</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <h3 className="font-bold mb-2">خطوات الاعتماد</h3>
                    <div className="space-y-2">
                      {selected.approvals.map((a) => (
                        <div key={a.id} className="p-2 rounded bg-slate-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{a.approverName}</p>
                            <Badge className={a.status === "معتمد" ? "bg-emerald-100 text-emerald-700" : a.status === "مرفوض" ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"}>
                              {a.status}
                            </Badge>
                          </div>
                          {a.status === "بانتظار الاعتماد" && (
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => decideContractApproval(selected.id, a.id, "معتمد")}>اعتماد</Button>
                              <Button size="sm" variant="outline" onClick={() => decideContractApproval(selected.id, a.id, "مرفوض")}>رفض</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-bold mb-2">التزامات العقد</h3>
                    <div className="space-y-2">
                      {selected.obligations.map((o) => (
                        <div key={o.id} className="p-2 rounded bg-slate-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{o.title}</p>
                            <Badge className={o.status === "مكتمل" ? "bg-emerald-100 text-emerald-700" : o.status === "متأخر" ? "bg-destructive/10 text-destructive" : "bg-blue-100 text-blue-700"}>
                              {o.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Due: {o.dueDate}</p>
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateContractObligationStatus(selected.id, o.id, "مكتمل")}>مكتمل</Button>
                            <Button size="sm" variant="outline" onClick={() => updateContractObligationStatus(selected.id, o.id, "متأخر")}>متأخر</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
