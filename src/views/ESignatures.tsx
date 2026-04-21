import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool, Send, CheckCircle2, Clock, AlertCircle, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUIStore } from '@/store/useUIStore';

export default function ESignatures() {
  const eSignatures = useUIStore((state) => state.eSignatures);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'تم التوقيع':
        return <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 gap-1"><CheckCircle2 size={12} /> {status}</Badge>;
      case 'بانتظار التوقيع':
        return <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 gap-1"><Clock size={12} /> {status}</Badge>;
      case 'منتهي الصلاحية':
        return <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 gap-1"><AlertCircle size={12} /> {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">مركز التوقيع الإلكتروني</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">إرسال المستندات والعقود للتوقيع الرقمي الآمن وتتبع حالتها.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => toast.success("تم تنفيذ العملية")}>
          <Send size={18} />
          طلب توقيع جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">بانتظار التوقيع</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">تم التوقيع بنجاح</p>
              <h3 className="text-2xl font-bold">128</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">إجمالي المستندات</p>
              <h3 className="text-2xl font-bold">133</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">طلبات التوقيع الأخيرة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">المستند</TableHead>
                <TableHead className="text-start">المستلم</TableHead>
                <TableHead className="text-start">تاريخ الإرسال</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eSignatures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <PenTool size={40} className="opacity-10" />
                      <p>لا توجد طلبات توقيع حالية</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                eSignatures.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-bold">{request.documentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{request.recipientName}</p>
                        <p className="text-[10px] text-slate-500">{request.recipientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{request.sentDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => toast.success("تم تنفيذ العملية")}>
                          <Download size={14} /> تحميل
                        </Button>
                        <Button variant="ghost" size="sm">تذكير</Button>
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
