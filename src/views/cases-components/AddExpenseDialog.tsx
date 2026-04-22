import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { Case } from "@/types";
import { useFinanceStore } from '@/store/useFinanceStore';

interface AddExpenseDialogProps {
  caseData: Case;
}

export default function AddExpenseDialog({ caseData }: AddExpenseDialogProps) {
  const addExpense = useFinanceStore((state) => state.addExpense);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addExpense({
      id: `EXP-${Date.now()}`,
      caseId: caseData.id,
      caseName: `${caseData.plaintiff} ضد ${caseData.defendant}`,
      category: String(fd.get('category')) as "رسوم قضائية" | "أتعاب خبراء" | "تنقلات" | "أخرى",
      amount: Number(fd.get('amount')),
      date: String(fd.get('date')),
      status: 'معلق',
      description: String(fd.get('description') || ''),
    });
    toast.success("تم إضافة المصروف بنجاح");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" size="sm" variant="outline" className="text-[10px] h-8 gap-1.5 border-slate-200 dark:border-white/10" onClick={() => setOpen(true)}>
        <Wallet size={12} /> إضافة مصروف
      </Button>
      <DialogContent className="bg-white dark:bg-navy-900">
        <DialogHeader>
          <DialogTitle className="font-bold">إضافة مصروف جديد</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الفئة</Label>
              <select name="category" title="الفئة" className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm">
                <option value="رسوم قضائية">رسوم قضائية</option>
                <option value="أتعاب خبراء">أتعاب خبراء</option>
                <option value="تنقلات">تنقلات</option>
                <option value="ترجمة">ترجمة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ (ر.س)</Label>
              <Input name="amount" type="number" required placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>التاريخ</Label>
            <Input name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Input name="description" placeholder="وصف المصروف..." />
          </div>
          <Button type="submit" className="w-full bg-primary-500 text-white hover:bg-primary-600">حفظ المصروف</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
