import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, AlertTriangle, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useComplianceStore } from '@/store/useComplianceStore';

export default function Compliance() {
  const compliance = useComplianceStore((state) => state.compliance);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الامتثال والحوكمة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة التراخيص، السجلات التجارية، ومتطلبات الحوكمة القانونية.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2">
          <Plus size={18} />
          إضافة سجل امتثال
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">سجلات سارية</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">
                {compliance.filter(r => r.status === 'ساري').length}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">قريبة الانتهاء</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">
                {compliance.filter(r => r.status === 'قريب الانتهاء').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">إجمالي السجلات</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{compliance.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">سجلات الامتثال والتراخيص</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">العنوان</TableHead>
                <TableHead className="text-start">النوع</TableHead>
                <TableHead className="text-start">تاريخ الانتهاء</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-start">التذكير</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compliance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {record.expiryDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      record.status === 'ساري' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                      record.status === 'قريب الانتهاء' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                      "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                    )}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>قبل {record.reminderDays} يوم</TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm">تعديل</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
