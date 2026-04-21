import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Plus, ChevronRight, ChevronLeft, Scale } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { cn, formatHijriDate } from "@/lib/utils";
import { useCasesStore } from '@/store/useCasesStore';
import { AddSessionDialog } from "./cases-components";

export default function SessionsCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const sessions = useCasesStore((state) => state.sessions);
  const deadlines = useCasesStore((state) => state.deadlines);

  const selectedDaySessions = sessions.filter(s => 
    date && isSameDay(new Date(s.date), date)
  );

  const selectedDayDeadlines = deadlines.filter(d => 
    date && isSameDay(new Date(d.date), date)
  );

  const totalEvents = selectedDaySessions.length + selectedDayDeadlines.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">تقويم الجلسات</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة مواعيد الجلسات القضائية والتحضير لها.</p>
        </div>
        <AddSessionDialog triggerContext="calendar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none dark:bg-navy-800 dark:text-white"
              locale={ar}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-navy-800">
          <CardHeader className="border-b border-slate-50 dark:border-white/5">
            <CardTitle className="text-lg font-bold text-navy-900 dark:text-white flex items-center justify-between">
              <div className="flex flex-col">
                <span>جلسات يوم {date ? format(date, "eeee, d MMMM yyyy", { locale: ar }) : "المحدد"}</span>
                {date && <span className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">{formatHijriDate(date)} هـ</span>}
              </div>
              <Badge variant="outline" className="text-primary-600 dark:text-primary-400 border-primary-100 dark:border-white/10">
                {totalEvents} مواعيد
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {totalEvents > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {/* Sessions */}
                {selectedDaySessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 border-none">
                            جلسة قضائية
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px]">{session.time}</Badge>
                          <h3 className="font-bold text-navy-900 dark:text-white">{session.caseName}</h3>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <MapPin size={14} className="text-primary-500" />
                            {session.court}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-primary-600 dark:text-primary-400 border-primary-100 dark:border-white/10">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Deadlines */}
                {selectedDayDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-r-4 border-amber-500">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border-none">
                            موعد نهائي
                          </Badge>
                          <Badge className={cn(
                            "text-[10px] px-1.5 py-0",
                            deadline.priority === 'high' ? "bg-destructive/10 text-destructive" :
                            deadline.priority === 'medium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {deadline.priority === 'high' ? 'عالية' : deadline.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                          <h3 className="font-bold text-navy-900 dark:text-white">{deadline.title}</h3>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Clock size={14} className="text-amber-500" />
                            النوع: {deadline.type}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Scale size={14} className="text-primary-500" />
                            رقم القضية: {deadline.caseId}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-amber-600 dark:text-amber-400 border-amber-100 dark:border-white/10">
                        تحديث الحالة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-slate-300 dark:text-slate-600" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">لا توجد جلسات مجدولة في هذا اليوم.</p>
                <div className="mt-4"><AddSessionDialog triggerContext="calendar" /></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
