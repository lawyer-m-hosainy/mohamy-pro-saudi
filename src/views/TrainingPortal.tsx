import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, BookOpen, Star, Trophy, 
  Target, BarChart3, Clock, ChevronLeft, 
  Play, CheckCircle2, FileText, Award,
  ArrowRight, Search, Layers
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useComplianceStore } from '@/store/useComplianceStore';
import { useTeamStore } from '@/store/useTeamStore';

export default function TrainingPortal() {
  const trainingPathways = useComplianceStore((state) => state.trainingPathways);
  const teamMembers = useTeamStore((state) => state.teamMembers);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-emerald-500 w-4 h-4" />;
      case 'InProgress': return <Clock className="text-blue-500 w-4 h-4" />;
      default: return <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-primary-500" />
            أكاديمية المحامي المتدرب (Training Academy)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">مسارات تدريبية احترافية لتأهيل المحامين المتدربين وفق ممارسات المكتب الفضلى.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-200 dark:border-white/10" onClick={() => toast.info("لوحة الشرف: أنت في المركز #3 هذا الشهر!")}>
            <Trophy size={16} className="text-amber-500" />
            لوحة الشرف
          </Button>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2 shadow-lg shadow-primary-500/20" onClick={() => window.location.href='/dashboard/library'}>
            <BookOpen size={18} />
            تصفح مكتبة الدورات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800 bg-primary-600 text-white col-span-1 lg:col-span-2 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <Badge className="bg-white/20 text-white border-none mb-4">نشط حالياً</Badge>
                <h3 className="text-2xl font-bold mb-2">{trainingPathways[0]?.title}</h3>
                <p className="text-primary-100 text-sm opacity-80 max-w-sm">
                  أنت الآن في المرحلة الثانية من التدقيق اللغوي والقانوني للمذكرات.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <Layers className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>التقدم الإجمالي</span>
                <span className="font-bold">{trainingPathways[0]?.overallProgress}%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white dark:bg-navy-900 h-full rounded-full transition-all duration-1000" 
                  ref={(el) => { if (el) el.style.width = `${trainingPathways[0]?.overallProgress}%`; }} 
                />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button className="bg-white dark:bg-navy-900 text-primary-700 hover:bg-white/90 font-bold px-8">متابعة التعلم</Button>
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i*10}/100/100`} alt="Avatar" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-500 flex items-center justify-center text-[10px] font-bold">
                  +5
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Award className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">1,250</h3>
                <p className="text-xs text-slate-500">نقاط الخبرة (XP)</p>
              </div>
              <div className="w-full pt-4 border-t border-slate-50 dark:border-white/5 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-lg font-bold">4</p>
                  <p className="text-[10px] text-slate-400">شارات مكتملة</p>
                </div>
                <div>
                  <p className="text-lg font-bold">#3</p>
                  <p className="text-[10px] text-slate-400">ترتيبك في المكتب</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800 border-s-4 border-primary-500">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Star className="text-primary-500 w-4 h-4" />
              المدرب المشرف (Mentor)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden">
                <img src="https://picsum.photos/seed/mentor/100/100" alt="Mentor" />
              </div>
              <div>
                <h4 className="text-sm font-bold">د. عبدالمحسن القحطاني</h4>
                <p className="text-[10px] text-slate-500">محامي شريك</p>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs h-9 hover:bg-primary-50 border-primary-100 text-primary-600">حجز جلسة توجيه</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm dark:bg-navy-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">الوحدات التدريبية (Modules)</CardTitle>
                <CardDescription>قائمة الدروس والمهام المطلوبة لإكمال المسار الحالي.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {trainingPathways[0]?.modules.map((mod: any, idx: number) => (
                  <div key={mod.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className={cn(
                          "text-sm font-bold",
                          mod.status === 'Completed' ? "text-slate-400 line-through" : "text-navy-900 dark:text-white"
                        )}>
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={10} /> 45 دقيقة
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <FileText size={10} /> 3 ملفات
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(mod.status)}
                      <Button 
                        variant="link" 
                        size="sm" 
                        className={cn(
                          "h-auto p-0 font-bold text-[11px]",
                          mod.status === 'Completed' ? "text-slate-400" : "text-primary-600"
                        )}
                       onClick={() => toast.success(mod.status === 'Completed' ? "جاري عرض نتيجة التقييم..." : "جاري بدء الوحدة التدريبية...")}>
                        {mod.status === 'Completed' ? 'عرض النتيجة' : 'بدء الوحدة'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-none shadow-sm dark:bg-navy-800 bg-emerald-50/50 dark:bg-emerald-900/5">
               <CardContent className="p-6">
                 <div className="flex items-start gap-4">
                   <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm dark:bg-navy-800 border border-emerald-100 dark:border-emerald-800">
                     <Target className="w-5 h-5 text-emerald-600" />
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-navy-900 dark:text-white mb-1">المهارات المستهدفة</h4>
                     <p className="text-xs text-slate-500 leading-relaxed">تنمية مهارات المرافعة الشفهية بنسبة 20% هذا الربع.</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             <Card className="border-none shadow-sm dark:bg-navy-800 bg-amber-50/50 dark:bg-amber-900/5">
               <CardContent className="p-6">
                 <div className="flex items-start gap-4">
                   <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm dark:bg-navy-800 border border-amber-100 dark:border-amber-800">
                     <Star className="w-5 h-5 text-amber-600" />
                   </div>
                   <div>
                     <h4 className="font-bold text-sm text-navy-900 dark:text-white mb-1">التقييم القادم</h4>
                     <p className="text-xs text-slate-500 leading-relaxed">باقي يومان على موعد تقييم وحدة "صياغة المذكرات".</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm dark:bg-navy-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold">المهام التدريبية (Weekly Tasks)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'تلخيص 5 أحكام تجارية', deadline: 'الأربعاء', type: 'بحث' },
                { title: 'مراجعة وكالات العميل X', deadline: 'الخميس', type: 'إجراءات' },
                { title: 'كتابة تكييف قانوني', deadline: 'الأحد', type: 'صياغة' },
              ].map((task, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-primary-500 transition-colors">{task.title}</h5>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{task.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                     <span className="flex items-center gap-1"><Clock size={10} /> الموعد: {task.deadline}</span>
                     <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-primary-600 font-bold" onClick={() => toast.success("تم تسليم المهمة بنجاح، بانتظار التقييم")}>تسليم ←</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-navy-800">
             <CardHeader>
               <CardTitle className="text-lg font-bold">موارد خارجية معتمدة</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {[
                 { title: 'أدلة ناجز الإرشادية', source: 'وزارة العدل' },
                 { title: 'أحكام المحكمة العليا', source: 'المجلس الأعلى للقضاء' },
                 { title: 'نظام المعاملات المدنية', source: 'الديوان الملكي' },
               ].map((res, i) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-slate-50 dark:border-white/5 last:border-0 grow">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
                       <Layers size={14} className="text-slate-500" />
                     </div>
                     <div>
                       <p className="text-xs font-bold">{res.title}</p>
                       <p className="text-[10px] text-slate-400">{res.source}</p>
                     </div>
                   </div>
                   <ArrowRight size={14} className="text-slate-300" />
                 </div>
               ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
