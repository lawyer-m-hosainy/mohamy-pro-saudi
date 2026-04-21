import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Phone, Mail, Filter, Search, MoreVertical, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useClientsStore } from '@/store/useClientsStore';

export default function CRM() {
  const leads = useClientsStore((state) => state.leads);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'قيد التواصل': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'تم تحديد موعد': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'تحول لعميل': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'مستبعد': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
      default: return '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة العملاء المحتملين (CRM)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة الاستشارات الأولية وتحويل المهتمين إلى عملاء دائمين.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2">
          <UserPlus size={18} />
          إضافة مهتم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المهتمين', value: '24', color: 'text-blue-600' },
          { label: 'قيد التواصل', value: '8', color: 'text-amber-600' },
          { label: 'تم تحويلهم لعملاء', value: '12', color: 'text-emerald-600' },
          { label: 'معدل التحويل', value: '50%', color: 'text-primary-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-navy-800">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <h3 className={cn("text-2xl font-bold", stat.color)}>{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">قائمة المتابعة</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="ps-9 h-9 rounded-md border-none bg-slate-50 dark:bg-white/5 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} />
              تصفية
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">الاسم</TableHead>
                <TableHead className="text-start">الاهتمام</TableHead>
                <TableHead className="text-start">المصدر</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-start">التاريخ</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد بيانات حالياً. ابدأ بإضافة أول مهتم.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold">{lead.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] flex items-center gap-1 text-slate-400"><Phone size={10} /> {lead.phone}</span>
                          <span className="text-[10px] flex items-center gap-1 text-slate-400"><Mail size={10} /> {lead.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lead.interest}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", getStatusColor(lead.status))}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{lead.createdAt}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-primary-600 gap-1">
                          تحويل لعميل <ArrowRight size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
