import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, CalendarClock, HandCoins, Scale, ShieldAlert, Plus } from "lucide-react";
import { useEnforcementStore } from '@/store/useEnforcementStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function statusClass(status: string) {
  if (status === "مفتوح") return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";
  if (status === "تحت إجراء 46") return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
  if (status === "حجز/منع") return "bg-destructive/10 text-destructive dark:bg-red-900/20 dark:text-red-400";
  if (status === "محصل جزئي") return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
}

export default function Enforcement() {
  const enforcementCases = useEnforcementStore((state) => state.enforcementCases);
  const addEnforcementCase = useEnforcementStore((state) => state.addEnforcementCase);
  const addAuditLog = useUIStore((state) => state.addAuditLog);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(enforcementCases[0]?.id || null);
  
  // Add Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    clientName: "",
    debtorName: "",
    amountClaimed: "",
  });

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseData.clientName || !newCaseData.debtorName || !newCaseData.amountClaimed) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    
    addEnforcementCase({
      id: `ENF-${Math.floor(Math.random() * 900000) + 100000}`,
      caseId: `C-${Math.floor(Math.random() * 900000) + 100000}`,
      clientId: `C-${Math.floor(Math.random() * 900000) + 100000}`,
      clientName: newCaseData.clientName,
      debtorName: newCaseData.debtorName,
      amountClaimed: Number(newCaseData.amountClaimed),
      amountCollected: 0,
      status: "مفتوح",
      createdAt: new Date().toISOString(),
      actions: [],
      orders: [],
      assets: []
    });
    
    toast.success("تم إنشاء ملف التنفيذ بنجاح");
    setIsAddOpen(false);
    setNewCaseData({ clientName: "", debtorName: "", amountClaimed: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة التنفيذ</h1>
          <p className="text-slate-500 mt-1">متابعة طلبات التنفيذ، إجراءات 46، أوامر الحجز والمنع والتحصيل.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary-100 text-primary-700 hidden sm:inline-flex">قسم جديد</Badge>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2">
                <Plus size={16} />
                إضافة ملف تنفيذ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>فتح ملف تنفيذ جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم العميل (طالب التنفيذ)</label>
                  <Input 
                    placeholder="مثال: شركة العزم" 
                    value={newCaseData.clientName}
                    onChange={(e) => setNewCaseData(prev => ({...prev, clientName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">المنفذ ضده</label>
                  <Input 
                    placeholder="مثال: مؤسسة الأفق" 
                    value={newCaseData.debtorName}
                    onChange={(e) => setNewCaseData(prev => ({...prev, debtorName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">مبلغ المطالبة (ريال)</label>
                  <Input 
                    type="number" 
                    placeholder="150000" 
                    value={newCaseData.amountClaimed}
                    onChange={(e) => setNewCaseData(prev => ({...prev, amountClaimed: e.target.value}))}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white mt-4">
                  حفظ وفتح الملف
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
            <CardTitle className="text-base text-navy-900 dark:text-white">تفاصيل ملف التنفيذ</CardTitle>
            <Button size="sm" variant="outline" className="dark:border-white/20 dark:text-white dark:hover:bg-white/10" onClick={logSensitiveAction} disabled={!selected}>تسجيل تدقيق العرض</Button>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-slate-500 dark:text-slate-400">لا توجد بيانات تنفيذ.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">المطالبة</p>
                    <p className="font-bold text-navy-900 dark:text-white">{selected.amountClaimed.toLocaleString()} ر.س</p>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">المحصل</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">{selected.amountCollected.toLocaleString()} ر.س</p>
                  </div>
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-xs text-blue-600 dark:text-blue-400">رقم القضية الأصلية</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">{selected.caseId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-navy-900 dark:text-slate-300">
                  <CalendarClock size={16} />
                  <span>مهلة المرحلة:</span>
                  <span className="font-bold">{selected.stageDeadline || "-"}</span>
                  {isSlaRisk(selected.stageDeadline) && (
                    <Badge className="bg-amber-100 text-amber-700 gap-1"><Bell size={12} /> تنبيه SLA</Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2 text-navy-900 dark:text-white"><Scale size={16} /> Timeline الإجراءات</h3>
                  <div className="space-y-2 border-s ps-4 border-slate-100 dark:border-white/10">
                    {selected.actions.map((a) => (
                      <div key={a.id} className="p-2 rounded-md bg-slate-50 dark:bg-white/5">
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.date} • {a.type} • بواسطة {a.performedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-navy-900 dark:text-white"><ShieldAlert size={16} /> أوامر التنفيذ</h3>
                    <div className="space-y-2">
                      {selected.orders.map((o) => (
                        <div key={o.id} className="p-2 rounded-md border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5">
                          <p className="text-sm text-navy-900 dark:text-white">{o.type} - <span className="font-bold">{o.status}</span></p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{o.issuedAt} • {o.referenceNumber || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-navy-900 dark:text-white"><HandCoins size={16} /> أصول المدين</h3>
                    <div className="space-y-2">
                      {selected.assets.map((a) => (
                        <div key={a.id} className="p-2 rounded-md border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5">
                          <p className="text-sm text-navy-900 dark:text-white">{a.type} - {a.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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
