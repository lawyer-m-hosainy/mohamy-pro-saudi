import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCasesStore } from '@/store/useCasesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { caseSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseToEdit?: any;
}

export default function NewCaseDialog({ open, onOpenChange, caseToEdit }: NewCaseDialogProps) {
  const addCase = useCasesStore((state) => state.addCase);
  const updateCase = useCasesStore((state) => state.updateCase);
  const clients = useClientsStore((state) => state.clients);
  const [newCaseData, setNewCaseData] = useState({
    id: "",
    clientId: "",
    court: "المحكمة التجارية" as any,
    type: "تجاري" as any,
    plaintiff: "",
    defendant: "",
    powerOfAttorneyRef: "",
    status: "نشطة" as any,
  });

  useEffect(() => {
    if (open) {
      if (caseToEdit) {
        setNewCaseData({
          id: caseToEdit.id || "",
          clientId: caseToEdit.clientId || "",
          court: caseToEdit.court || "المحكمة التجارية",
          type: caseToEdit.type || "تجاري",
          plaintiff: caseToEdit.plaintiff || "",
          defendant: caseToEdit.defendant || "",
          powerOfAttorneyRef: caseToEdit.powerOfAttorneyRef || "",
          status: caseToEdit.status || "نشطة",
        });
      } else {
        setNewCaseData({
          id: "",
          clientId: "",
          court: "المحكمة التجارية",
          type: "تجاري",
          plaintiff: "",
          defendant: "",
          powerOfAttorneyRef: "",
          status: "نشطة",
        });
      }
    }
  }, [open, caseToEdit]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      caseSchema.parse(newCaseData);
      
      if (caseToEdit) {
        updateCase(caseToEdit.id, newCaseData as any);
        toast.success("تم تحديث القضية بنجاح");
      } else {
        addCase({
          ...newCaseData,
          memorandums: [],
          najizReferenceStatus: "غير مربوط",
          createdAt: new Date().toISOString(),
        } as any);
        toast.success("تم إضافة القضية بنجاح");
      }

      onOpenChange(false);
      setNewCaseData({
        id: "",
        clientId: "",
        court: "المحكمة التجارية",
        type: "تجاري",
        plaintiff: "",
        defendant: "",
        powerOfAttorneyRef: "",
        status: "نشطة",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("حدث خطأ غير متوقع");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-none shadow-2xl dark:bg-navy-900 bg-white">
        <DialogHeader>
          <DialogTitle className="text-navy-900 dark:text-white font-bold">
            {caseToEdit ? "تعديل بيانات القضية" : "إضافة قضية جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateCase} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>الموكل (إجباري)</Label>
            <select 
              title="الموكل"
              className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-navy-900 dark:text-white"
              value={newCaseData.clientId}
              onChange={e => setNewCaseData(p => ({ ...p, clientId: e.target.value }))}
            >
              <option value="" className="dark:bg-navy-900">— اختر موكلاً —</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="dark:bg-navy-900">
                  {client.name} ({client.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رقم القضية / المرجع</Label>
              <Input 
                placeholder="مثلاً: 45/123-ت" 
                value={newCaseData.id}
                onChange={e => setNewCaseData(p => ({ ...p, id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الوكالة</Label>
              <Input 
                placeholder="رقم الوكالة بالعدل" 
                value={newCaseData.powerOfAttorneyRef}
                onChange={e => setNewCaseData(p => ({ ...p, powerOfAttorneyRef: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المحكمة</Label>
              <select 
                title="المحكمة"
                className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
                value={newCaseData.court}
                onChange={e => setNewCaseData(p => ({ ...p, court: e.target.value as any }))}
              >
                <option value="المحكمة التجارية">المحكمة التجارية</option>
                <option value="المحكمة العامة">المحكمة العامة</option>
                <option value="المحكمة العمالية">المحكمة العمالية</option>
                <option value="المحكمة الجزائية">المحكمة الجزائية</option>
                <option value="ديوان المظالم">ديوان المظالم</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>نوع القضية</Label>
              <select 
                title="نوع القضية"
                className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
                value={newCaseData.type}
                onChange={e => setNewCaseData(p => ({ ...p, type: e.target.value as any }))}
              >
                <option value="تجاري">تجاري</option>
                <option value="عمالي">عمالي</option>
                <option value="عام">عام</option>
                <option value="جزائي">جزائي</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المدعي</Label>
              <Input 
                placeholder="اسم المدعي" 
                value={newCaseData.plaintiff}
                onChange={e => setNewCaseData(p => ({ ...p, plaintiff: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>المدعى عليه</Label>
              <Input 
                placeholder="اسم المدعى عليه" 
                value={newCaseData.defendant}
                onChange={e => setNewCaseData(p => ({ ...p, defendant: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>الحالة الأولية</Label>
            <select 
              title="الحالة الأولية"
              className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
              value={newCaseData.status}
              onChange={e => setNewCaseData(p => ({ ...p, status: e.target.value as any }))}
            >
              <option value="نشطة">نشطة</option>
              <option value="تحت الدراسة">تحت الدراسة</option>
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
              {caseToEdit ? "حفظ التعديلات" : "حفظ القضية"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
