import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Pause, Plus, Calendar, User, Scale } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useFinanceStore } from '@/store/useFinanceStore';
import { useCasesStore } from '@/store/useCasesStore';
import { useTeamStore } from '@/store/useTeamStore';

export default function TimeTracking() {
  const timeEntries = useFinanceStore((state) => state.timeEntries);
  const addTimeEntry = useFinanceStore((state) => state.addTimeEntry);
  const cases = useCasesStore((state) => state.cases) ?? [];
  const teamMembers = useTeamStore((state) => state.teamMembers) ?? [];
  const [isTracking, setIsTracking] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCaseId, setManualCaseId] = useState("");
  const [manualLawyerId, setManualLawyerId] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manualHours, setManualHours] = useState("1");
  const [manualMinutes, setManualMinutes] = useState("0");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">تتبع الوقت</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">تسجيل الساعات القابلة للفلترة والعمل على القضايا والاستشارات.</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-none shadow-sm dark:bg-navy-800 px-4 py-2 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">الوقت الحالي</p>
              <p className="text-xl font-mono font-bold">00:45:12</p>
            </div>
            <Button 
              onClick={() => setIsTracking(!isTracking)}
              className={isTracking ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
              size="icon"
            >
              {isTracking ? <Pause size={20} /> : <Play size={20} />}
            </Button>
          </Card>
          <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => setManualOpen(true)}>
            <Plus size={18} />
            إضافة يدوية
          </Button>
        </div>
      </div>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl dark:bg-navy-900 bg-white">
          <DialogHeader>
            <DialogTitle className="text-navy-900 dark:text-white">إضافة وقت يدوياً</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualCaseId || !manualLawyerId) {
                toast.error("اختر القضية والمحامي");
                return;
              }
              const h = Math.max(0, parseInt(manualHours, 10) || 0);
              const m = Math.max(0, Math.min(59, parseInt(manualMinutes, 10) || 0));
              const durationMin = h * 60 + m;
              if (durationMin <= 0) {
                toast.error("أدخل مدة صحيحة");
                return;
              }
              addTimeEntry({
                id: `TE-${Date.now()}`,
                caseId: manualCaseId,
                lawyerId: manualLawyerId,
                description: manualDesc.trim() || "عمل يدوي",
                duration: durationMin,
                date: manualDate,
                isBilled: false,
              });
              toast.success("تم تسجيل الوقت");
              setManualOpen(false);
              setManualDesc("");
            }}
          >
            <div className="space-y-2">
              <Label>القضية</Label>
              <Select value={manualCaseId} onValueChange={(v) => v && setManualCaseId(v)}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="اختر قضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id} — {c.plaintiff} ضد {c.defendant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المحامي</Label>
              <Select value={manualLawyerId} onValueChange={(v) => v && setManualLawyerId(v)}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="اختر عضو الفريق" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-desc">الوصف</Label>
              <Input id="manual-desc" value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="مثال: مراجعة مذكرة" className="dark:bg-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="manual-date">التاريخ</Label>
                <Input id="manual-date" type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>ساعات</Label>
                  <Input type="number" min={0} value={manualHours} onChange={(e) => setManualHours(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>دقائق</Label>
                  <Input type="number" min={0} max={59} value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
              حفظ
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">إجمالي ساعات الأسبوع</p>
            <h3 className="text-2xl font-bold">32.5 ساعة</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">ساعات قابلة للفلترة</p>
            <h3 className="text-2xl font-bold text-emerald-600">28.0 ساعة</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">القيمة المتوقعة</p>
            <h3 className="text-2xl font-bold text-primary-600">14,000 ر.س</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">سجل الوقت</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">المحامي</TableHead>
                <TableHead className="text-start">القضية</TableHead>
                <TableHead className="text-start">الوصف</TableHead>
                <TableHead className="text-start">التاريخ</TableHead>
                <TableHead className="text-start">المدة</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => {
                const lawyer = teamMembers.find(m => m.id === entry.lawyerId);
                const caseItem = cases.find(c => c.id === entry.caseId);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        {lawyer?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Scale size={14} className="text-slate-400" />
                        {caseItem?.plaintiff} ضد {caseItem?.defendant}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar size={14} className="text-slate-400" />
                        {entry.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      {Math.floor(entry.duration / 60)}س {entry.duration % 60}د
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.isBilled ? "secondary" : "outline"} className={entry.isBilled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : ""}>
                        {entry.isBilled ? 'تمت الفوترة' : 'بانتظار الفوترة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm">تعديل</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
