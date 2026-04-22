import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle, Sparkles, Loader2, ListTodo, Calendar as CalendarIcon } from "lucide-react";
import { useCasesStore } from "@/store/useCasesStore";
import { useClientsStore } from "@/store/useClientsStore";
import { useTeamStore } from "@/store/useTeamStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useInvoicesStore } from "@/store/useInvoicesStore";
import { cn } from "@/lib/utils";
import React, { useState, useMemo, useEffect } from "react";
import { draftLegalDocument } from "@/services/geminiService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";



const categoryData = [
  { name: 'تجاري', value: 40, color: '#006c35', bgClass: 'bg-[#006c35]' },
  { name: 'عمالي', value: 25, color: '#d4af37', bgClass: 'bg-[#d4af37]' },
  { name: 'جزائي', value: 20, color: '#0b2e59', bgClass: 'bg-[#0b2e59]' },
  { name: 'أحوال شخصية', value: 15, color: '#338b5b', bgClass: 'bg-[#338b5b]' },
];

const MemoizedBarChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
      <Tooltip 
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        cursor={{ fill: '#f1f5f9' }}
      />
      <Bar dataKey="value" fill="#006c35" radius={[4, 4, 0, 0]} barSize={40} />
    </BarChart>
  </ResponsiveContainer>
));

const MemoizedPieChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));

export default function Dashboard() {
  const navigate = useNavigate();
  const cases = useCasesStore(state => state.cases);
  const clients = useClientsStore(state => state.clients);
  const tasks = useTeamStore(state => state.tasks);
  const updateTaskStatus = useTeamStore(state => state.updateTaskStatus);
  const invoices = useInvoicesStore(state => state.invoices);
  const loadInvoices = useInvoicesStore(state => state.loadInvoices);
  const getFinancialSummary = useAnalyticsStore(state => state.getFinancialSummary);
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState("");
  const [draftType, setDraftType] = useState("لائحة دعوى");
  const [facts, setFacts] = useState("");

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);

  const dynamicRevenueData = useMemo(() => {
    if (invoices.length === 0) return [
      { name: 'التراكمي', value: summary.totalRevenue || 0 }
    ];
    
    // Group invoices by month
    const grouped: Record<string, number> = {};
    invoices.forEach(inv => {
       const date = new Date(inv.date);
       const month = date.toLocaleString('ar-SA', { month: 'long' });
       grouped[month] = (grouped[month] || 0) + inv.total;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [invoices, summary]);

  const handleDraft = async () => {
    if (!facts.trim()) return;
    setIsDrafting(true);
    try {
      const result = await draftLegalDocument(draftType, facts);
      setDraftResult(result);
    } catch (error) {
      setDraftResult("حدث خطأ أثناء الصياغة.");
    } finally {
      setIsDrafting(false);
    }
  };

  const stats = useMemo(() => [
    { title: "إجمالي القضايا", value: cases.length, icon: Scale, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-900/20" },
    { title: "العملاء النشطون", value: clients.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "قضايا قيد الدراسة", value: cases.filter(c => c.status === 'تحت الدراسة').length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "قضايا منتهية", value: cases.filter(c => c.status === 'مغلقة').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ], [cases, clients]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">لوحة القيادة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">نظرة عامة على أداء المكتب والعمليات الحالية.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="w-full sm:w-auto gap-2 border-primary-200 dark:border-white/10 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-white/5" />}>
              <Sparkles size={18} />
              صياغة ذكية
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white dark:bg-navy-900">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
                  <Sparkles className="text-primary-500" />
                  المساعد القانوني - صياغة الوثائق
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">نوع الوثيقة</label>
                    <select 
                      title="نوع الوثيقة"
                      aria-label="نوع الوثيقة"
                      className="w-full p-2 rounded-md border border-slate-200 dark:border-white/10 bg-transparent text-sm dark:text-white"
                      value={draftType}
                      onChange={(e) => setDraftType(e.target.value)}
                    >
                      <option className="dark:bg-navy-900">لائحة دعوى</option>
                      <option className="dark:bg-navy-900">مذكرة جوابية</option>
                      <option className="dark:bg-navy-900">لائحة اعتراضية</option>
                      <option className="dark:bg-navy-900">عقد تأسيس شركة</option>
                      <option className="dark:bg-navy-900">اتفاقية عدم إفصاح</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">وقائع القضية / التفاصيل</label>
                    <Textarea 
                      placeholder="اكتب هنا وقائع القضية أو تفاصيل العقد المراد صياغته..."
                      className="h-48 resize-none dark:bg-white/5"
                      value={facts}
                      onChange={(e) => setFacts(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white gap-2"
                    onClick={handleDraft}
                    disabled={isDrafting || !facts.trim()}
                  >
                    {isDrafting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    بدء الصياغة الآلية
                  </Button>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 flex flex-col">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">المسودة الناتجة</label>
                  <ScrollArea className="flex-1 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-md p-4">
                    {draftResult ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap dark:text-slate-300">
                        {draftResult}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                        <FileText size={48} className="mb-2 opacity-20" />
                        <p className="text-xs">سيظهر النص المصاغ هنا بعد الضغط على زر البدء</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-navy-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color || "text-slate-600")} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              تحليل الإيرادات (ر.س)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <MemoizedBarChart data={dynamicRevenueData} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-500" />
              توزيع القضايا
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px] flex flex-col items-center">
            <MemoizedPieChart data={categoryData} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", item.bgClass)} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.name}</span>
                  <span className="text-xs font-bold mr-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary-500" />
              المهام الحالية
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600"
              onClick={() => {
                navigate("/dashboard/tasks");
                toast.info("تم فتح صفحة المهام لإضافة مهمة جديدة");
              }}
            >
              إضافة مهمة
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      className={cn(
                        "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                        task.status === 'completed' ? "bg-primary-500 border-primary-500 text-white" : "border-slate-200 dark:border-white/20"
                      )}
                    >
                      {task.status === 'completed' && <CheckCircle2 size={12} />}
                    </button>
                    <div>
                      <p className={cn("text-sm font-bold", task.status === 'completed' ? "text-slate-400 line-through" : "text-navy-900 dark:text-white")}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {task.dueDate}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          task.priority === 'high' ? "bg-red-50 text-red-600" : 
                          task.priority === 'medium' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                    onClick={() => toast.info(`تنبيه المهمة: ${task.title}`)}
                  >
                    <AlertCircle size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-accent-500" />
              تنبيهات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400">موعد جلسة قادم</p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">قضية شركة الراجحي - غداً الساعة 10:00 صباحاً</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
              <p className="text-xs font-bold text-primary-800 dark:text-primary-400">تحديث من ناجز</p>
              <p className="text-xs text-primary-700 dark:text-primary-500 mt-1">تم تحديث حالة 3 قضايا مرتبطة بنجاح.</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-400">عميل جديد</p>
              <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">تمت إضافة "خالد بن وليد الشمري" إلى قائمة العملاء.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
