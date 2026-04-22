import React, { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  FileCheck, ShieldAlert, History, Plus, 
  Search, Filter, Lock, Unlock, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useComplianceStore } from '@/store/useComplianceStore';
import { useCasesStore } from '@/store/useCasesStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function LegalQA() {
  const qaReviews = useComplianceStore((state) => state.qaReviews);
  const addQAReview = useComplianceStore((state) => state.addQAReview);
  const cases = useCasesStore((state) => state.cases) ?? [];
  const updateQAChecklist = useComplianceStore((state) => state.updateQAChecklist);
  const updateQAStatus = useComplianceStore((state) => state.updateQAStatus);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isPartner = hasPermission('*');
  const [newReviewOpen, setNewReviewOpen] = useState(false);
  const [newReviewCaseId, setNewReviewCaseId] = useState("");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  
  const activeReview = qaReviews.find((r: any) => r.id === activeReviewId) || qaReviews[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Rejected': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
      case 'RequiresChanges': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'بانتظار المراجعة';
      case 'Approved': return 'تم الاعتماد المهني';
      case 'Rejected': return 'مرفوض';
      case 'RequiresChanges': return 'يتطلب تعديلات';
      default: return status;
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
            <ShieldCheck className="text-primary-500" />
            الجودة المهنية والمراجعة (QA)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">نظام تدقيق المذكرات واللوائح لضمان الامتثال للمعايير المهنية قبل الإيداع القضائي.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-200 dark:border-white/10" onClick={() => toast.info("سجل المراجعات")}>
            <History size={16} />
            سجل المراجعات
          </Button>
          <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white gap-2 shadow-lg shadow-primary-500/20" onClick={() => setNewReviewOpen(true)}>
            <Plus size={18} />
            طلب مراجعة جديد
          </Button>
        </div>
      </div>

      <Dialog open={newReviewOpen} onOpenChange={setNewReviewOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="font-bold">طلب مراجعة مهنية جديد</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newReviewCaseId) {
                toast.error("اختر القضية المرتبطة");
                return;
              }
              addQAReview({
                id: `QA-${Date.now()}`,
                caseId: newReviewCaseId,
                reviewerId: currentUser?.id || "U-001",
                status: "Pending",
                checklist: [
                  { id: "QA-CH-1", requirement: "التحقق من صحة بيانات الوكالة في ناجز", isMet: false },
                  { id: "QA-CH-2", requirement: "مراجعة المذكرة لغوياً وقانونياً", isMet: false },
                  { id: "QA-CH-3", requirement: "موافاة العميل بالنسخة النهائية للاعتماد", isMet: false },
                ],
                overallComment: "طلب مراجعة جديد",
              });
              toast.success("تم إنشاء طلب المراجعة");
              setNewReviewOpen(false);
              setNewReviewCaseId("");
            }}
          >
            <div className="space-y-2">
              <Label>القضية</Label>
              <Select value={newReviewCaseId} onValueChange={(v) => v && setNewReviewCaseId(v)}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue placeholder="اختر قضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.length > 0 ? (
                    cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.plaintiff} ضد {c.defendant}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-slate-500 text-center">لا توجد قضايا مضافة حالياً.</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary-600 text-white hover:bg-primary-700">
              إنشاء الطلب
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm dark:bg-navy-800 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <Badge className="bg-amber-400/20 text-amber-400 border-none">حرجة</Badge>
            </div>
            <h3 className="text-lg font-bold mb-1">قفل الجودة (QA Lock)</h3>
            <p className="text-navy-100 text-xs leading-relaxed opacity-80">
              يوجد حالياً صفتقان مجمّدتان بانتظار المراجعة النهائية قبل الموعد النهائي للإيداع.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">تم اعتمادها هذا الأسبوع</p>
                <h3 className="text-2xl font-bold">12 مذكرة</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">متوسط وقت المراجعة</p>
                <h3 className="text-2xl font-bold">4.2 ساعة</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-none shadow-sm dark:bg-navy-800 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">طلبات المراجعة النشطة</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="بحث..." className="ps-8 h-8 rounded-md bg-slate-50 dark:bg-white/5 text-xs w-48 border-none" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("تم تنفيذ العملية")}><Filter size={14} /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-start">القضية / المستند</TableHead>
                    <TableHead className="text-start">المحامي</TableHead>
                    <TableHead className="text-start">الحالة المهنية</TableHead>
                    <TableHead className="text-start">التقدم</TableHead>
                    <TableHead className="text-end">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaReviews.map((review: any) => {
                    const caseData = cases.find((c: any) => c.id === review.caseId);
                    const completedItems = review.checklist.filter((i: any) => i.isMet).length;
                    const totalItems = review.checklist.length;
                    
                    return (
                      <TableRow key={review.id} className="border-slate-50 dark:border-white/5 group hover:bg-slate-50/80 dark:hover:bg-white/5">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-navy-900 dark:text-white">{caseData?.plaintiff} ضد {caseData?.defendant}</span>
                            <span className="text-[10px] text-slate-500">مذكرة جوابية - الدفاع</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">د. عبدالمحسن</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[10px] shadow-none", getStatusColor(review.status))}>
                            {getStatusLabel(review.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-500 rounded-full" 
                                ref={(el: HTMLDivElement | null) => { if(el) el.style.width = `${Math.min(100, (completedItems / totalItems) * 100)}%`; }} 
                              />
                            </div>
                            <span className="text-[10px]">{completedItems}/{totalItems}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-8 gap-1 text-primary-600 transition-colors", activeReview?.id === review.id ? "bg-primary-50 dark:bg-primary-900/20" : "")} 
                            onClick={() => {
                              setActiveReviewId(review.id);
                              toast.success("تم فتح تفاصيل المراجعة");
                            }}
                          >
                            مراجعة الآن
                            <ChevronRight size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-navy-800 bg-emerald-50/50 dark:bg-emerald-900/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">مركز التوجيه المهني (QA Insights)</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    استناداً إلى المراجعات الأخيرة، نلاحظ تحسناً كبيراً في صياغة "الدفوع الشكلية". يوصى بتحديث المقال المعرفي الخاص بـ "التنازع الاختصاصي" ليعكس أحدث أحكام المحكمة العليا.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary-600 mt-2 text-sm font-bold" onClick={() => toast.success("تم تنفيذ العملية")}>تحديث المستودع المعرفي ←</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm dark:bg-navy-800">
            <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-500" />
                نموذج التحقق (Checklist)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activeReview ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg mb-4">
                    <p className="text-xs font-bold text-navy-900 dark:text-white mb-1">العرض النشط:</p>
                    <p className="text-xs text-slate-500">
                      {(() => {
                        const c = cases.find((c: any) => c.id === activeReview.caseId);
                        return c ? `مراجعة ${c.plaintiff} ضد ${c.defendant}` : `طلب مراجعة ${activeReview.id}`;
                      })()}
                    </p>
                  </div>
                  {activeReview.checklist.map((item: any) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-start gap-3 group transition-opacity",
                        isPartner ? "cursor-pointer" : "opacity-70 cursor-not-allowed"
                      )} 
                      onClick={() => isPartner && updateQAChecklist(activeReview.id, item.id, !item.isMet)}
                    >
                      <div className={cn(
                        "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        item.isMet ? "bg-primary-500 border-primary-500 text-white" : "border-slate-300 dark:border-white/20"
                      )}>
                        {item.isMet && <CheckCircle2 size={12} />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          item.isMet ? "text-slate-400 line-through" : "text-navy-900 dark:text-white group-hover:text-primary-500"
                        )}>
                          {item.requirement}
                        </p>
                        {item.comment && <p className="text-[10px] text-rose-500 mt-1">{item.comment}</p>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-slate-50 dark:border-white/5 grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                      disabled={!isPartner}
                      onClick={() => updateQAStatus(activeReview.id, 'Rejected')}
                    >
                      مرفوض
                    </Button>
                    <Button 
                      className="bg-primary-500 hover:bg-primary-600 text-white text-xs"
                      disabled={!isPartner}
                      onClick={() => updateQAStatus(activeReview.id, 'Approved')}
                    >
                      اعتماد نهائي
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-sm text-slate-500">لا توجد مراجعات نشطة</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-navy-800 bg-amber-50 dark:bg-amber-900/10 border-s-4 border-amber-400">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock size={16} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-1">التزام مهني</h4>
                  <p className="text-xs text-amber-800 dark:text-amber-400/80 leading-relaxed">
                    لا يمكن إغلاق القضية أو الإيداع في ناجز ما لم يتم استكمال نموذج التحقق المهني بنسبة 100%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
