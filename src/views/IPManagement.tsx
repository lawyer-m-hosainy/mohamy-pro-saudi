import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fingerprint, Plus, Search, Calendar, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIPStore } from '@/store/useIPStore';

export default function IPManagement() {
  const ipRecords = useIPStore((state) => state.ipRecords);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة الملكية الفكرية</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">تتبع العلامات التجارية، براءات الاختراع، وحقوق المؤلف للعملاء.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => toast.success("تم تنفيذ العملية")}>
          <Plus size={18} />
          تسجيل ملكية فكرية
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">العلامات التجارية</p>
              <Shield size={18} className="text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold">{ipRecords.filter(r => r.type === 'علامة تجارية').length}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">براءات الاختراع</p>
              <Fingerprint size={18} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold">{ipRecords.filter(r => r.type === 'براءة اختراع').length}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">حقوق المؤلف</p>
              <User size={18} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold">{ipRecords.filter(r => r.type === 'حق مؤلف').length}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">تحت الفحص</p>
              <Search size={18} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold">{ipRecords.filter(r => r.status === 'تحت الفحص').length}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">الاسم / العنوان</TableHead>
                <TableHead className="text-start">النوع</TableHead>
                <TableHead className="text-start">المالك</TableHead>
                <TableHead className="text-start">رقم التسجيل</TableHead>
                <TableHead className="text-start">تاريخ الانتهاء</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ipRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-bold">{record.title}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.owner}</TableCell>
                  <TableCell className="font-mono text-xs">{record.registrationNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar size={14} className="text-slate-400" />
                      {record.expiryDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      record.status === 'مسجلة' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                      record.status === 'تحت الفحص' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                      "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                    )}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" onClick={() => toast.success("تم تنفيذ العملية")}>تجديد</Button>
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
