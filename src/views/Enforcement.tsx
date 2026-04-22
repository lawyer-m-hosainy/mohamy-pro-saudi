import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, CalendarClock, HandCoins, Scale, ShieldAlert } from "lucide-react";
import { useEnforcementStore } from '@/store/useEnforcementStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

function statusClass(status: string) {
  if (status === "مفتوح") return "bg-slate-100 text-slate-700";
  if (status === "تحت إجراء 46") return "bg-amber-100 text-amber-700";
  if (status === "حجز/منع") return "bg-destructive/10 text-destructive";
  if (status === "محصل جزئي") return "bg-blue-100 text-blue-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function Enforcement() {
  const enforcementCases = useEnforcementStore((state) => state.enforcementCases);
  const addAuditLog = useUIStore((state) => state.addAuditLog);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(enforcementCases[0]?.id || null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enforcementCases;
    return enforcementCases.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.caseId.toLowerCase().includes(q) ||
        e.clientName.toLowerCase().includes(q) ||
        e.debtorName.toLowerCase().includes(q)
    );
  }, [enforcementCases, query]);

  const selected = filtered.find((x) => x.id === selectedId) || filtered[0];

  const isSlaRisk = (date?: string) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff <= 3 * 24 * 60 * 60 * 1000;
  };

  const logSensitiveAction = () => {
    if (!selected) return;
    addAuditLog({
      id: `AL-ENF-${Date.now()}`,
      userId: currentUser?.id || "unknown",
      userName: currentUser?.name || "unknown",
      action: "View Enforcement Details",
      module: "enforcement",
      details: `Viewed enforcement case ${selected.id}`,
      timestamp: new Date().toISOString(),
    });
    toast.success("تم تسجيل عملية التدقيق بنجاح");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة التنفيذ</h1>
          <p className="text-slate-500 mt-1">متابعة طلبات التنفيذ، إجراءات 46، أوامر الحجز والمنع والتحصيل.</p>
        </div>
        <Badge className="bg-primary-100 text-primary-700">قسم جديد</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-navy-800">
          <CardHeader>
            <CardTitle className="text-base">قائمة ملفات التنفيذ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث برقم الملف/القضية/العميل..."
              aria-label="بحث ملفات التنفيذ"
              className="bg-white dark:bg-slate-800"
            />
            <div className="space-y-2 max-h-[420px] overflow-auto pe-1">
              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Scale size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">لا توجد ملفات تنفيذ</p>
                </div>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-start p-3.5 rounded-lg border-2 transition-all duration-200 ${
                    selected?.id === item.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md shadow-primary-500/10"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 hover:shadow-sm dark:bg-navy-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold text-sm ${selected?.id === item.id ? "text-primary-700 dark:text-primary-300" : "text-navy-900 dark:text-white"}`}>{item.id}</span>
                    <Badge className={statusClass(item.status)}>{item.status}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.clientName} <span className="text-slate-400 dark:text-slate-500">ضد</span> {item.debtorName}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <HandCoins size={12} />
                      {item.amountClaimed.toLocaleString()} ر.س
                    </span>
                    {item.stageDeadline && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CalendarClock size={12} />
                        {item.stageDeadline}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">تفاصيل ملف التنفيذ</CardTitle>
            <Button size="sm" variant="outline" onClick={logSensitiveAction} disabled={!selected}>تسجيل تدقيق العرض</Button>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-slate-500">لا توجد بيانات تنفيذ.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-slate-500">المطالبة</p>
                    <p className="font-bold">{selected.amountClaimed.toLocaleString()} ر.س</p>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50">
                    <p className="text-xs text-emerald-600">المحصل</p>
                    <p className="font-bold text-emerald-700">{selected.amountCollected.toLocaleString()} ر.س</p>
                  </div>
                  <div className="p-3 rounded-md bg-blue-50">
                    <p className="text-xs text-blue-600">رقم القضية الأصلية</p>
                    <p className="font-bold text-blue-700">{selected.caseId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CalendarClock size={16} />
                  <span>مهلة المرحلة:</span>
                  <span className="font-bold">{selected.stageDeadline || "-"}</span>
                  {isSlaRisk(selected.stageDeadline) && (
                    <Badge className="bg-amber-100 text-amber-700 gap-1"><Bell size={12} /> تنبيه SLA</Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Scale size={16} /> Timeline الإجراءات</h3>
                  <div className="space-y-2 border-s ps-4">
                    {selected.actions.map((a) => (
                      <div key={a.id} className="p-2 rounded-md bg-slate-50">
                        <p className="text-sm font-bold">{a.title}</p>
                        <p className="text-xs text-slate-500">{a.date} • {a.type} • بواسطة {a.performedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2"><ShieldAlert size={16} /> أوامر التنفيذ</h3>
                    <div className="space-y-2">
                      {selected.orders.map((o) => (
                        <div key={o.id} className="p-2 rounded-md border">
                          <p className="text-sm">{o.type} - <span className="font-bold">{o.status}</span></p>
                          <p className="text-xs text-slate-500">{o.issuedAt} • {o.referenceNumber || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2"><HandCoins size={16} /> أصول المدين</h3>
                    <div className="space-y-2">
                      {selected.assets.map((a) => (
                        <div key={a.id} className="p-2 rounded-md border">
                          <p className="text-sm">{a.type} - {a.description}</p>
                          <p className="text-xs text-slate-500">
                            قيمة تقديرية: {a.estimatedValue?.toLocaleString() || "-"} • {a.isFrozen ? "محجوز" : "غير محجوز"}
                          </p>
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
