import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCasesStore } from '@/store/useCasesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { caseSchema } from '@/lib/schemas';
import { getNextCounter, saveCases } from '@/services/legalDataService';
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
    circuit: "",
    title: "",
    automatedNumber: "",
    clientRole: "مدعي" as any,
    type: "تجاري" as any,
    plaintiff: "",
    defendant: "",
    powerOfAttorneyRef: "",
    status: "متداولة" as any,
  });

  useEffect(() => {
    if (open) {
      if (caseToEdit) {
        setNewCaseData({
          id: caseToEdit.id || "",
          clientId: caseToEdit.clientId || "",
          court: caseToEdit.court || "المحكمة التجارية",
          circuit: caseToEdit.circuit || "",
          title: caseToEdit.title || "",
          automatedNumber: caseToEdit.automatedNumber || "",
          clientRole: caseToEdit.clientRole || "مدعي",
          type: caseToEdit.type || "تجاري",
          plaintiff: caseToEdit.plaintiff || "",
          defendant: caseToEdit.defendant || "",
          powerOfAttorneyRef: caseToEdit.powerOfAttorneyRef || "",
          status: caseToEdit.status || "متداولة",
        });
      } else {
        setNewCaseData({
          id: "",
          clientId: "",
          court: "المحكمة التجارية",
          circuit: "",
          title: "",
          automatedNumber: "",
          clientRole: "مدعي",
          type: "تجاري",
          plaintiff: "",
          defendant: "",
          powerOfAttorneyRef: "",
          status: "متداولة",
        });
      }
    }
  }, [open, caseToEdit]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      caseSchema.parse(newCaseData);
      
      let finalCaseData = { ...newCaseData } as any;

      if (caseToEdit) {
        if (finalCaseData.status === "محفوظة" && !caseToEdit.archiveCode) {
           finalCaseData.archiveCode = await getNextCounter('archive');
        }
        updateCase(caseToEdit.id, finalCaseData);
        // Sync to backend if needed
        await saveCases([finalCaseData]);
        toast.success("تم تحديث القضية بنجاح");
      } else {
        const generatedCirculationCode = await getNextCounter('circulation');
        const newCaseObj = {
          ...finalCaseData,
          circulationCode: generatedCirculationCode,
          memorandums: [],
          najizReferenceStatus: "غير مربوط",
          createdAt: new Date().toISOString(),
        };
        addCase(newCaseObj);
        await saveCases([newCaseObj]);
        toast.success("تم إضافة القضية بنجاح");
      }

      onOpenChange(false);
      setNewCaseData({
        id: "",
        clientId: "",
        court: "المحكمة التجارية",
        circuit: "",
        title: "",
        automatedNumber: "",
        clientRole: "مدعي",
        type: "تجاري",
        plaintiff: "",
        defendant: "",
        powerOfAttorneyRef: "",
        status: "متداولة",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]?.message || "خطأ في المدخلات");
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
                placeholder="مثلاً: 45-123-ت" 
                value={newCaseData.id}
                onChange={e => setNewCaseData(p => ({ ...p, id: e.target.value.replace(/\//g, '-') }))}
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
              <Label>الدائرة</Label>
              <Input 
                placeholder="رقم أو اسم الدائرة" 
                value={newCaseData.circuit}
                onChange={e => setNewCaseData(p => ({ ...p, circuit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>مسمى القضية</Label>
              <Input 
                placeholder="مثل: مطالبة مالية" 
                value={newCaseData.title}
                onChange={e => setNewCaseData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الرقم الآلي</Label>
              <Input 
                placeholder="الرقم الآلي للقضية" 
                value={newCaseData.automatedNumber}
                onChange={e => setNewCaseData(p => ({ ...p, automatedNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>صفة الموكل</Label>
              <select 
                title="صفة الموكل"
                className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
                value={newCaseData.clientRole}
                onChange={e => setNewCaseData(p => ({ ...p, clientRole: e.target.value as any }))}
              >
                <option value="مدعي">مدعي</option>
                <option value="مدعى عليه">مدعى عليه</option>
              </select>
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
              <option value="متداولة">متداولة</option>
              <option value="تحت الدراسة">تحت الدراسة</option>
              {caseToEdit && <option value="محفوظة">محفوظة</option>}
              {caseToEdit && <option value="مغلقة">مغلقة</option>}
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
