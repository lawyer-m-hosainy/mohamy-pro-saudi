import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, DollarSign, Users, Scale, Calendar, 
  Download, Printer, Share2, Filter, AlertCircle,
  FileText, Briefcase, ChevronRight, Activity
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from '@/store/useAnalyticsStore';

export default function PartnerReporting() {
  const getFinancialSummary = useAnalyticsStore((state) => state.getFinancialSummary);
  const getAttorneyPerformance = useAnalyticsStore((state) => state.getAttorneyPerformance);
  const getPracticeAreaStats = useAnalyticsStore((state) => state.getPracticeAreaStats);
  const financial = getFinancialSummary();
  const perfo = getAttorneyPerformance();
  const areas = getPracticeAreaStats();

  const COLORS = ['#006c35', '#d4af37', '#64748b', '#0ea5e9', '#f43f5e'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">تقارير الشركاء والإدارة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">نظرة استراتيجية شاملة على الأداء المالي والتشغيلي والمخاطر للمكتب.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-200 dark:border-white/10" onClick={() => toast.success("تم تصفية البيانات للربع الحالي")}>
            <Filter size={16} />
            تصفية الفترة
          </Button>
          <Button className="bg-primary-500 text-white gap-2 shadow-lg shadow-primary-500/20" onClick={() => window.print()}>
            <Download size={16} />
            تصدير التقرير التنفيذي
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-navy-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                <DollarSign size={20} />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 border-none">+8.2%</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">إجمالي الدخل (شامل الضريبة)</p>
            <h3 className="text-2xl font-bold mt-1">{(financial.totalRevenue + financial.totalVat).toLocaleString()} ر.س</h3>
            <p className="text-[10px] text-slate-400 mt-2">ضريبة القيمة المضافة (15%): {financial.totalVat.toLocaleString()} ر.س</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                <Activity size={20} />
              </div>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 border-none">92%</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">كفاءة التحصيل</p>
            <h3 className="text-2xl font-bold mt-1">{financial.collectionRate.toFixed(1)}%</h3>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
               <div 
                 className="h-full bg-amber-500 rounded-full" 
                 ref={(el) => { if (el) el.style.width = `${financial.collectionRate}%`; }}
               />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
                <Scale size={20} />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-none">فعّال</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">معدل كسب القضايا</p>
            <h3 className="text-2xl font-bold mt-1">87%</h3>
            <p className="text-[10px] text-slate-400 mt-2">إجمالي 142 قضية منتهية هذا العام</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">القيمة التقديرية (Pipeline)</p>
            <h3 className="text-2xl font-bold mt-1">{financial.projectedRevenue.toLocaleString()} ر.س</h3>
            <p className="text-[10px] text-slate-400 mt-2">عقود تحت التفاوض: 14 عقد</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
           <CardHeader className="border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-bold">توزيع الأرباح حسب التخصص القانوني</CardTitle>
             <div className="flex gap-2">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary-500" /> <span className="text-[10px]">القضايا</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /> <span className="text-[10px]">الاستشارات</span></div>
             </div>
           </CardHeader>
           <CardContent className="p-6 h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areas}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="area" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                  <Bar dataKey="value" fill="#006c35" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
           <CardHeader className="border-b border-slate-50 dark:border-white/5">
             <CardTitle className="text-lg font-bold">تحليل محفظة القضايا</CardTitle>
           </CardHeader>
           <CardContent className="p-6 h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areas}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {areas.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
         <CardHeader>
            <CardTitle className="text-lg font-bold">مؤشرات أداء المحامين (KPIs)</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400">
                    <th className="px-6 py-4 text-start">المحامي</th>
                    <th className="px-6 py-4 text-center">القضايا النشطة</th>
                    <th className="px-6 py-4 text-center">الساعات المفلوترة</th>
                    <th className="px-6 py-4 text-center">معدل الفوز</th>
                    <th className="px-6 py-4 text-center">التحصيل المالي</th>
                    <th className="px-6 py-4 text-end">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {perfo.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xs">
                             {p.name.charAt(0)}
                           </div>
                           <span className="text-sm font-bold">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{p.cases}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono">{p.billableHours} س</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                           <span className="text-xs font-bold">{p.winningRate}%</span>
                           <div className="w-20 bg-slate-100 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" ref={(el) => { if(el) el.style.width = `${p.winningRate}%`; }} />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">{(p.billableHours * 450).toLocaleString()} ر.س</td>
                      <td className="px-6 py-4 text-end">
                         <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-none">متفوق</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-none shadow-sm dark:bg-navy-800 border-s-4 border-amber-500">
            <CardContent className="p-6 flex items-start gap-4">
               <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                 <AlertCircle size={24} />
               </div>
               <div>
                  <h4 className="font-bold">تنبيه ضريبي (ZATCA Phase 2)</h4>
                  <p className="text-sm text-slate-500 mt-1">يجب استكمال ربط المنصة مع نظام الفاتورة الإلكترونية للمرحلة الثانية قبل نهاية الربع الحالي لتجنب المخالفات.</p>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm dark:bg-navy-800 border-s-4 border-primary-500">
            <CardContent className="p-6 flex items-start gap-4">
               <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
                 <Calendar size={24} />
               </div>
               <div>
                  <h4 className="font-bold">الاجتماع السنوي للشركاء</h4>
                  <p className="text-sm text-slate-500 mt-1">تمت جدولة موعد عرض التقارير المالية الختامية لشهر ديسمبر في 31/12/2025.</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button variant="ghost" className="text-slate-400 gap-2" onClick={() => window.print()}>
           <Printer size={16} />
           طباعة النسخة الورقية للمحضر
        </Button>
      </div>
    </motion.div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold", className)}>
      {children}
    </span>
  );
}
