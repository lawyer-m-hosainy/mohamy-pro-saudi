import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bell, CheckCircle2, FileText, ShieldCheck, Timer } from "lucide-react";
import { useAdvisoryStore } from '@/store/useAdvisoryStore';
import { useAuthStore } from '@/store/useAuthStore';

function statusColor(status: string) {
  if (status === "جديد") return "bg-slate-100 text-slate-700";
  if (status === "قيد المراجعة") return "bg-blue-100 text-blue-700";
  if (status === "مسودة رأي") return "bg-amber-100 text-amber-700";
  if (status === "اعتماد شريك") return "bg-purple-100 text-purple-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function AdvisoryDesk() {
  const advisoryRequests = useAdvisoryStore((state) => state.advisoryRequests);
  const currentUser = useAuthStore((state) => state.currentUser);
  const addAdvisoryOpinion = useAdvisoryStore((state) => state.addAdvisoryOpinion);
  const updateAdvisoryStatus = useAdvisoryStore((state) => state.updateAdvisoryStatus);
  const decideAdvisoryApproval = useAdvisoryStore((state) => state.decideAdvisoryApproval);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(advisoryRequests[0]?.id || null);
  const [opinionDraft, setOpinionDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return advisoryRequests;
    return advisoryRequests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q)
    );
  }, [advisoryRequests, query]);

  const selected = filtered.find((x) => x.id === selectedId) || filtered[0];

  const isSlaBreaching = (date: string) => {
    const d = new Date(date).getTime();
    const diff = d - Date.now();
    return diff <= 24 * 60 * 60 * 1000;
  };

  const leadTimeHours = (createdAt: string, closedAt?: string) => {
    const start = new Date(createdAt).getTime();
    const end = closedAt ? new Date(closedAt).getTime() : Date.now();
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60)));
  };

  const submitOpinion = () => {
    if (!selected || !opinionDraft.trim()) return;
    addAdvisoryOpinion(selected.id, {
      id: `OP-${Date.now()}`,
      requestId: selected.id,
      content: opinionDraft.trim(),
      authorId: currentUser?.id || "unknown",
      createdAt: new Date().toISOString(),
    });
    updateAdvisoryStatus(selected.id, "مسودة رأي");
    setOpinionDraft("");
    toast.success("تم حفظ مسودة الرأي");
  };

  const sendForPartnerApproval = () => {
    if (!selected) return;
    updateAdvisoryStatus(selected.id, "اعتماد شريك");
    toast.success("تم تحويل الطلب لاعتماد الشريك");
  };

  const closeAdvisory = () => {
    if (!selected) return;
    updateAdvisoryStatus(selected.id, "مغلق");
    toast.success("تم إغلاق طلب الاستشارة");
  };

  const approve = (approvalId: string, approved: boolean) => {
    if (!selected) return;
    decideAdvisoryApproval(selected.id, approvalId, approved ? "معتمد" : "مرفوض");
    if (approved) {
      updateAdvisoryStatus(selected.id, "مغلق");
    }
    toast.success(approved ? "تم الاعتماد" : "تم الرفض");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الاستشارات القانونية</h1>
          <p className="text-slate-500 mt-1">Inbox الاستشارات المؤسسية مع SLA واعتماد داخلي.</p>
        </div>
        <Badge className="bg-primary-100 text-primary-700">Legal Advisory Desk</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-navy-800">
          <CardHeader>
            <CardTitle className="text-base">Inbox الاستشارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث بالعنوان أو العميل..."
              aria-label="بحث الاستشارات"
            />
            <div className="space-y-2 max-h-[480px] overflow-auto">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="w-full text-start p-3 rounded-md border hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary-700">{r.id}</span>
                    <Badge className={statusColor(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.clientName}</p>
                  {isSlaBreaching(r.slaDueAt) && r.status !== "مغلق" && (
                    <Badge className="mt-2 bg-amber-100 text-amber-700 gap-1"><Bell size={12} /> تنبيه SLA</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">مراجعة وكتابة الرأي</CardTitle>
            {selected && <Badge className={statusColor(selected.status)}>{selected.status}</Badge>}
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-slate-500">لا توجد طلبات.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-slate-500">مقدم الطلب</p>
                    <p className="font-bold">{selected.requestedBy}</p>
                  </div>
                  <div className="p-3 rounded-md bg-blue-50">
                    <p className="text-xs text-blue-600">المكلف</p>
                    <p className="font-bold text-blue-700">{selected.assignedTo}</p>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50">
                    <p className="text-xs text-emerald-600">Lead Time</p>
                    <p className="font-bold text-emerald-700 flex items-center gap-1"><Timer size={14} /> {leadTimeHours(selected.createdAt, selected.closedAt)} ساعة</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2"><FileText size={16} /> موضوع الاستشارة</h3>
                  <div className="p-3 rounded-md bg-slate-50 text-sm">{selected.title}</div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">مسودة الرأي</h3>
                  <Textarea
                    value={opinionDraft}
                    onChange={(e) => setOpinionDraft(e.target.value)}
                    placeholder="اكتب الرأي القانوني هنا..."
                    className="min-h-[140px]"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" onClick={submitOpinion}>حفظ مسودة</Button>
                    <Button size="sm" variant="outline" onClick={sendForPartnerApproval}>إرسال لاعتماد شريك</Button>
                    <Button size="sm" variant="outline" onClick={closeAdvisory}>إغلاق</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16} /> سجل الاعتمادات</h3>
                  <div className="space-y-2">
                    {selected.approvals.length === 0 && (
                      <p className="text-xs text-slate-500">لا توجد خطوات اعتماد حتى الآن.</p>
                    )}
                    {selected.approvals.map((a) => (
                      <div key={a.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">{a.approverName}</p>
                          <Badge className={a.status === "معتمد" ? "bg-emerald-100 text-emerald-700" : a.status === "مرفوض" ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"}>
                            {a.status}
                          </Badge>
                        </div>
                        {a.status === "بانتظار الاعتماد" && (
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => approve(a.id, true)} className="gap-1"><CheckCircle2 size={14} /> اعتماد</Button>
                            <Button size="sm" variant="outline" onClick={() => approve(a.id, false)}>رفض</Button>
                          </div>
                        )}
                      </div>
                    ))}
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
