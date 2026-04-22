import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, Target, TrendingUp, Users, FileText, 
  ArrowUpRight, ArrowDownRight, Briefcase, 
  CheckCircle2, Clock, AlertCircle, DollarSign,
  PieChart as PieChartIcon, BarChart3, Search, Filter
} from "lucide-react";
import { useClientsStore } from '@/store/useClientsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function BDDashboard() {
  const keyAccounts = useClientsStore((state) => state.keyAccounts);
  const proposals = useClientsStore((state) => state.proposals);
  const pricingModels = useFinanceStore((state) => state.pricingModels);
  const clients = useClientsStore((state) => state.clients);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مسودة': return 'bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-400';
      case 'مرسلة': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'قيد التفاوض': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'مقبولة': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'مرفوضة': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
      default: return '';
    }
  };

  const totalPipeValue = proposals.reduce((acc: number, p: any) => acc + p.value, 0);
  const weightedValue = proposals.reduce((acc: number, p: any) => acc + (p.value * (p.winProbability / 100)), 0);
  const winRate = 65; // Mocked for simplicity

  const stats = [
    { title: "قيمة الفرص (Pipeline)", value: `${totalPipeValue.toLocaleString()} ر.س`, trend: "+15%", trendUp: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "القيمة المرجحة", value: `${Math.round(weightedValue).toLocaleString()} ر.س`, trend: "+12%", trendUp: true, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "نسبة الفوز", value: `${winRate}%`, trend: "-2%", trendUp: false, icon: CheckCircle2, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-900/20" },
    { title: "كبار العملاء", value: keyAccounts.length, trend: "+1", trendUp: true, icon: Users, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  const pipelineData = [
    { name: 'مسودة', value: proposals.filter((p: any) => p.status === 'مسودة').length },
    { name: 'مرسلة', value: proposals.filter((p: any) => p.status === 'مرسلة').length },
    { name: 'تفاوض', value: proposals.filter((p: any) => p.status === 'قيد التفاوض').length },
    { name: 'مقبولة', value: proposals.filter((p: any) => p.status === 'مقبولة').length },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-primary-500" />
            تطوير الأعمال والصفقات (BD)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة كبار العملاء، العروض الفنية والمالية، ونماذج التسعير المتقدمة.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-200 dark:border-white/10">
            <Filter size={16} />
            تصفية
          </Button>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2 shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]" onClick={() => toast.info("سيتم فتح نافذة إنشاء العرض")}>
            <Plus size={18} />
            إنشاء عرض سعر جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-navy-800 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                  stat.trendUp ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white">توزيع عروض الأسعار حسب المرحلة</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary-600">عرض التفاصيل</Button>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                  cursor={{ fill: 'rgba(0, 108, 53, 0.05)' }}
                />
                <Bar dataKey="value" name="عدد العروض" fill="#006c35" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white">كبار العملاء (Key Accounts)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {keyAccounts.map((account: any) => {
                const client = clients.find((c: any) => c.id === account.clientId);
                return (
                  <div key={account.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-navy-900 dark:text-white group-hover:text-primary-500 transition-colors">
                        {client?.name}
                      </span>
                      <Badge className={cn(
                        "text-[10px]",
                        account.strategicValue === 'High' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20" : "bg-blue-50 text-blue-700"
                      )}>
                        {account.strategicValue === 'High' ? 'استراتيجي' : 'مهم'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{account.industry}</span>
                      <span className="font-bold text-navy-800 dark:text-slate-300">
                        {account.currentPipeValue.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        ref={(el) => { if (el) el.style.width = `${Math.min(100, (account.currentPipeValue / account.annualTargetRevenue) * 100)}%`; }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4">
          <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            عروض الأسعار النشطة (Active Proposals)
          </CardTitle>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="بحث في العروض..." 
              className="ps-9 h-9 rounded-md border-none bg-slate-50 dark:bg-white/5 text-sm w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start">العرض</TableHead>
                <TableHead className="text-start">العميل</TableHead>
                <TableHead className="text-start">نموذج التسعير</TableHead>
                <TableHead className="text-start">القيمة</TableHead>
                <TableHead className="text-start">احتمالية الفوز</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-end">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal: any) => {
                const keyAccount = keyAccounts.find((ka: any) => ka.id === proposal.keyAccountId);
                const client = clients.find((c: any) => c.id === keyAccount?.clientId);
                const model = pricingModels.find((m: any) => m.id === proposal.pricingModelId);
                
                return (
                  <TableRow key={proposal.id} className="border-slate-50 dark:border-white/5 group hover:bg-slate-50/80 dark:hover:bg-white/5">
                    <TableCell className="font-bold text-navy-900 dark:text-white max-w-[250px] truncate">
                      {proposal.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {client?.name || "عميل محتمل"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal border-slate-200 dark:border-white/10">
                        {model?.type} - {model?.description}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-primary-600 dark:text-primary-400">
                      {proposal.value.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              proposal.winProbability > 70 ? "bg-emerald-500" : proposal.winProbability > 40 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            ref={(el) => { if (el) el.style.width = `${proposal.winProbability}%`; }} 
                          />
                        </div>
                        <span className="text-xs">{proposal.winProbability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] shadow-none", getStatusColor(proposal.status))}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end text-xs text-slate-500">
                      {proposal.createdAt}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm dark:bg-navy-800 bg-gradient-to-br from-primary-600 to-emerald-700 text-white border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Target className="w-8 h-8 text-white" />
              </div>
              <ArrowUpRight className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">الرؤية الاستراتيجية للفترة القادمة</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              من المتوقع نمو قطاع "الاتصالات والتقنية" بنسبة 25% نتيجة المشاريع القائمة. يوصى بتركيز جهود تطوير الأعمال على حلول الملكية الفكرية المتقدمة.
            </p>
            <div className="flex items-center gap-4">
              <Button className="bg-white dark:bg-navy-900 text-primary-700 hover:bg-white/90">تحديث المحفظة</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 underline">مشاهدة التقارير</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800 border-dashed border-2 border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-8 text-center bg-transparent">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
            <Plus className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">إضافة وحدة تسعير جديدة</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
            هل تحتاج إلى نموذج تسعير مخصص؟ يمكنك إنشاء نماذج جديدة تربط بين الساعات والمخرجات.
          </p>
          <Button variant="outline" className="border-primary-500 text-primary-600 hover:bg-primary-50" onClick={() => toast.info("قريباً: إضافة نماذج التسعير الديناميكية")}>بدء الإعداد</Button>
        </Card>
      </div>
    </motion.div>
  );
}
