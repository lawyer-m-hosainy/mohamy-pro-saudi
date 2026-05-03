import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCasesStore } from "@/store/useCasesStore";
import { Calendar, AlertCircle } from "lucide-react";

export default function SessionsRoll() {
  const cases = useCasesStore(state => state.cases);
  const sessions = useCasesStore(state => state.sessions);
  const deadlines = useCasesStore(state => state.deadlines);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  // Generate roll rows
  const generateRoll = () => {
    if (!startDate || !endDate) return [];
    
    let rollItems: any[] = [];
    
    sessions.forEach(session => {
      if (session.date >= startDate && session.date <= endDate) {
        const relatedCase = cases.find(c => c.id === session.caseId);
        if (activeOnly && relatedCase?.status !== 'متداولة') return;
        rollItems.push({
          type: 'session',
          date: session.date,
          caseId: relatedCase?.id || session.caseId,
          caseTitle: relatedCase?.title || relatedCase?.plaintiff || session.caseName,
          code: relatedCase?.circulationCode || relatedCase?.archiveCode || '-',
          details: session.time + (session.notes ? ` - ${session.notes}` : ''),
        });
      }
    });

    deadlines.forEach(deadline => {
      if (deadline.date >= startDate && deadline.date <= endDate) {
        if (deadline.type === 'انتهاء مدة استئناف' || deadline.title.includes('استئناف') || deadline.title.includes('تمييز')) {
          const relatedCase = cases.find(c => c.id === deadline.caseId);
          if (activeOnly && relatedCase?.status !== 'متداولة') return;
          rollItems.push({
            type: 'deadline',
            date: deadline.date,
            caseId: relatedCase?.id || deadline.caseId,
            caseTitle: relatedCase?.title || relatedCase?.plaintiff || '',
            code: relatedCase?.circulationCode || relatedCase?.archiveCode || '-',
            details: deadline.title,
          });
        }
      }
    });

    return rollItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const rollData = generateRoll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">رول الجلسات</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">عرض جلسات ومواعيد الاستئناف في فترة محددة</p>
        </div>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800 p-4">
        <div className="flex items-end gap-4 mb-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-bold">من تاريخ</label>
            <input type="date" className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 px-3 bg-transparent" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-bold">إلى تاريخ</label>
            <input type="date" className="w-full h-10 rounded-md border border-slate-200 dark:border-white/10 px-3 bg-transparent" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mb-2 flex-1">
            <input type="checkbox" id="activeOnly" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} className="rounded" />
            <label htmlFor="activeOnly" className="text-sm font-bold">القضايا المتداولة فقط</label>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow>
              <TableHead className="font-bold text-navy-900 dark:text-white">التاريخ</TableHead>
              <TableHead className="font-bold text-navy-900 dark:text-white">القضية</TableHead>
              <TableHead className="font-bold text-navy-900 dark:text-white">الكود</TableHead>
              <TableHead className="font-bold text-navy-900 dark:text-white">التفاصيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rollData.length > 0 ? rollData.map((item, idx) => (
              <TableRow key={idx} className={item.type === 'deadline' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                <TableCell className="font-bold whitespace-nowrap">
                  {item.date}
                </TableCell>
                <TableCell>
                  <p className="font-bold text-navy-900 dark:text-white">{item.caseId}</p>
                  <p className="text-xs text-slate-500">{item.caseTitle}</p>
                </TableCell>
                <TableCell className="font-mono text-sm">{item.code}</TableCell>
                <TableCell>
                  {item.type === 'deadline' ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                      <AlertCircle size={16} />
                      {item.details}
                    </div>
                  ) : (
                    item.details
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  حدد فترة زمنية لعرض الجلسات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
