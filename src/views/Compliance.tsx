import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, AlertTriangle, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useComplianceStore } from '@/store/useComplianceStore';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Compliance() {
  const compliance = useComplianceStore((state) => state.compliance);
  const updateComplianceRecord = useComplianceStore((state) => state.updateComplianceRecord);
  const removeComplianceRecord = useComplianceStore((state) => state.removeComplianceRecord);

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  
  const [editOpen, setEditOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<any>(null);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  const handleEditSave = () => {
    if (!recordToEdit?.title) {
      toast.error("يرجى إدخال العنوان");
      return;
    }
    updateComplianceRecord(recordToEdit.id, recordToEdit);
    setEditOpen(false);
    toast.success("تم تحديث السجل بنجاح");
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      removeComplianceRecord(recordToDelete.id);
      setDeleteOpen(false);
      toast.success("تم حذف السجل بنجاح");
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
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">الامتثال والحوكمة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة التراخيص، السجلات التجارية، ومتطلبات الحوكمة القانونية.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          إضافة سجل امتثال
        </Button>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="dark:bg-navy-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>إضافة سجل امتثال جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان السجل</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="dark:bg-white/5 dark:border-white/10" placeholder="مثال: رخصة البلدية" />
              </div>
              <Button onClick={() => {
                if(!newTitle) {
                  toast.error("يرجى إدخال العنوان");
                  return;
                }
                addComplianceRecord({
                  id: `COMP-${Date.now()}`,
                  title: newTitle,
                  type: 'أخرى',
                  expiryDate: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0],
                  status: 'ساري',
                  reminderDays: 30
                });
                setAddOpen(false);
                setNewTitle("");
                toast.success("تم إضافة سجل الامتثال");
              }} className="w-full bg-primary-600 hover:bg-primary-700 text-white">حفظ السجل</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="dark:bg-navy-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>تعديل سجل الامتثال</DialogTitle>
            </DialogHeader>
            {recordToEdit && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input 
                    value={recordToEdit.title} 
                    onChange={(e) => setRecordToEdit({...recordToEdit, title: e.target.value})} 
                    className="dark:bg-white/5 dark:border-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Input 
                    type="date"
                    value={recordToEdit.expiryDate} 
                    onChange={(e) => setRecordToEdit({...recordToEdit, expiryDate: e.target.value})} 
                    className="dark:bg-white/5 dark:border-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={recordToEdit.status} onValueChange={(v) => setRecordToEdit({...recordToEdit, status: v})}>
                    <SelectTrigger className="dark:bg-navy-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-navy-800">
                      <SelectItem value="ساري">ساري</SelectItem>
                      <SelectItem value="قريب الانتهاء">قريب الانتهاء</SelectItem>
                      <SelectItem value="منتهي">منتهي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={handleEditSave} className="w-full bg-primary-600 hover:bg-primary-700 text-white">حفظ التعديلات</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete AlertDialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent className="dark:bg-navy-900 dark:text-white dark:border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف السجل '{recordToDelete?.title}' بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="dark:bg-navy-800 dark:hover:bg-white/5 mt-0">إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-white/5"
                        onClick={() => { setRecordToEdit(record); setEditOpen(true); }}
                      >
                        تعديل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => { setRecordToDelete(record); setDeleteOpen(true); }}
                      >
                        حذف
                      </Button>
                    </div>
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
