import React from 'react';
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Info, Gavel, User, UserCheck, Hash, Clock } from "lucide-react";
import { Case, Session, Expense, Task, Deadline } from "@/types";
import AddSessionDialog from "./AddSessionDialog";
import AddDeadlineDialog from "./AddDeadlineDialog";
import AddTaskDialog from "./AddTaskDialog";
import AddExpenseDialog from "./AddExpenseDialog";
import CaseTimeline from "./CaseTimeline";
import CaseSummaryCards from "./CaseSummaryCards";
import { useClientsStore } from "@/store/useClientsStore";

interface CaseDetailsPanelProps {
  caseData: Case;
  sessions: Session[];
  expenses: Expense[];
  tasks: Task[];
  deadlines: Deadline[];
}

export default function CaseDetailsPanel({ caseData, sessions, expenses, tasks, deadlines }: CaseDetailsPanelProps) {
  const caseSessions = sessions.filter(s => s.caseId === caseData.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const caseExpenses = expenses.filter(e => e.caseId === caseData.id);
  const caseTasks = tasks.filter(t => t.caseId === caseData.id);
  const totalExpenses = caseExpenses.reduce((sum, e) => sum + e.amount, 0);

  const clients = useClientsStore(state => state.clients);
  const caseClient = clients.find(c => c.id === caseData.clientId);

  const timelineEvents = [
    { date: '2024-01-10', title: 'استلام القضية', description: 'تم استلام ملف القضية وتوقيع العقد' },
    { date: '2024-01-25', title: 'رفع الدعوى', description: 'تم قيد الدعوى في المحكمة التجارية' },
    { date: '2024-02-15', title: 'الجلسة الأولى', description: 'حضور الجلسة وتقديم لائحة الادعاء' },
    { date: '2024-03-05', title: 'تبادل المذكرات', description: 'تقديم مذكرة الرد على دفوع المدعى عليه' },
  ];

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Case Info Column */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-4">
            <Info size={16} className="text-primary-500" />
            تفاصيل القضية
          </h4>
          <div className="space-y-3 bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Gavel size={12} /> المحكمة
              </span>
              <span className="font-bold text-navy-900 dark:text-white">{caseData.court}</span>
            </div>
            {caseClient && (
               <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-400 flex items-center gap-1.5">
                   <User size={12} /> الموكل المرتبط
                 </span>
                 <span className="font-bold text-navy-900 dark:text-white">
                   {caseClient.name} <span className="text-slate-400 font-normal">({caseData.clientRole || 'مدعي'})</span>
                 </span>
               </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Hash size={12} /> كود التداول
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">{caseData.circulationCode || '-'}</span>
            </div>
            {caseData.archiveCode && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Hash size={12} /> كود الحفظ
                </span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{caseData.archiveCode}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Hash size={12} /> الرقم الآلي
              </span>
              <span className="font-mono font-bold text-navy-900 dark:text-white">{caseData.automatedNumber || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Info size={12} /> المسمى
              </span>
              <span className="font-bold text-navy-900 dark:text-white">{caseData.title || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Info size={12} /> الدائرة
              </span>
              <span className="font-bold text-navy-900 dark:text-white">{caseData.circuit || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User size={12} /> المدعي
              </span>
              <span className="font-bold text-navy-900 dark:text-white">{caseData.plaintiff}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <UserCheck size={12} /> المدعى عليه
              </span>
              <span className="font-bold text-navy-900 dark:text-white">{caseData.defendant}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Hash size={12} /> رقم الوكالة
              </span>
              <span className="font-mono font-bold text-primary-600">{caseData.powerOfAttorneyRef}</span>
            </div>
            {caseData.createdAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} /> تاريخ القيد
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {format(new Date(caseData.createdAt), "yyyy/MM/dd", { locale: ar })}
                </span>
              </div>
            )}
          </div>
        </div>

        {!['محفوظة', 'مغلقة'].includes(caseData.status) && (
          <div className="flex flex-wrap gap-2">
            <AddSessionDialog caseData={caseData} />
            <AddDeadlineDialog caseId={caseData.id} />
            <AddTaskDialog caseId={caseData.id} />
            <AddExpenseDialog caseData={caseData} />
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <h4 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-4">
            <Info size={16} className="text-primary-500" />
            المرفقات والمستندات
          </h4>
          <div className="space-y-3 bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
            {!['محفوظة', 'مغلقة'].includes(caseData.status) && (
              <div className="flex items-center justify-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-dashed border-slate-200 dark:border-white/20 cursor-pointer transition-colors">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                  إضافة مرفق جديد (مثل الوكالة)
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
              <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Info size={14} className="text-primary-500" /> وكالة الموكل.pdf
              </span>
              <span className="text-[10px] text-slate-400">1.2 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Column */}
      <CaseTimeline events={timelineEvents} />

      {/* Summary Cards Column */}
      <CaseSummaryCards 
        caseId={caseData.id}
        totalExpenses={totalExpenses}
        caseSessions={caseSessions}
        caseTasks={caseTasks}
        memorandumsCount={caseData.memorandums?.length || 0}
        deadlines={deadlines}
      />
    </div>
  );
}
