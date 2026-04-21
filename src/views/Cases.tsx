import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MoreHorizontal, Link2, Link2Off, ChevronDown, ChevronUp, Plus, Edit, Trash2 } from "lucide-react";
import { useCasesStore } from "@/store/useCasesStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useTeamStore } from "@/store/useTeamStore";
import { cn } from "@/lib/utils";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import {
  NewCaseDialog,
  CaseDetailsPanel,
  MemorandumsDialog,
  useCaseActions
} from "./cases-components";

export default function Cases() {
  const cases = useCasesStore(state => state.cases);
  const sessions = useCasesStore(state => state.sessions);
  const deadlines = useCasesStore(state => state.deadlines);
  const deleteCase = useCasesStore(state => state.deleteCase);
  const expenses = useFinanceStore(state => state.expenses);
  const tasks = useTeamStore(state => state.tasks);

  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredCases = (cases || []).filter(c => {
    const matchesSearch = c.id?.includes(searchQuery) || 
                          c.court?.includes(searchQuery) || 
                          c.plaintiff?.includes(searchQuery) || 
                          c.defendant?.includes(searchQuery);
    const matchesStatus = filterStatus === "الكل" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const currentCases = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const { handleLinkToNajiz } = useCaseActions();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة القضايا</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة القضايا، المذكرات، والربط مع منصة ناجز العدلية.</p>
        </div>
        
        <Button
          type="button"
          className="bg-primary-500 hover:bg-primary-600 text-white gap-2 shadow-lg shadow-primary-500/20"
          onClick={() => setIsNewCaseOpen(true)}
        >
          <Plus size={18} />
          قضية جديدة
        </Button>
        <NewCaseDialog 
          open={isNewCaseOpen} 
          onOpenChange={(open) => {
            setIsNewCaseOpen(open);
            if (!open) setCaseToEdit(null);
          }} 
          caseToEdit={caseToEdit}
        />
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800 overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-50 dark:border-white/5 bg-white dark:bg-navy-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="البحث برقم القضية، المحكمة، أو أطراف الدعوى..." 
                className="ps-10 bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-primary-500/20"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-400 dark:border-white/10">
                  <Filter size={18} />
                  تصفية {filterStatus !== "الكل" && `(${filterStatus})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-navy-800 dark:border-white/10 w-36">
                <DropdownMenuItem onClick={() => { setFilterStatus("الكل"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  الكل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilterStatus("نشطة"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  نشطة فقط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilterStatus("تحت الدراسة"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  تحت الدراسة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilterStatus("مغلقة"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  مغلقة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">رقم القضية</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">المحكمة</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">أطراف الدعوى</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">الحالة</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">ناجز</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">المذكرات</TableHead>
                <TableHead className="text-end font-bold text-navy-900 dark:text-white">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCases.length > 0 ? currentCases.map((c: any) => {
                const isExpanded = expandedCase === c.id;
                
                return (
                  <React.Fragment key={c.id}>
                    <TableRow 
                      className={cn(
                        "transition-colors cursor-pointer group",
                        isExpanded ? "bg-primary-50/30 dark:bg-primary-900/10" : "hover:bg-slate-50/50 dark:hover:bg-white/5"
                      )}
                      onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                    >
                      <TableCell className="p-0 text-center">
                        <div className="flex items-center justify-center">
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-primary-500" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary-600 dark:text-primary-400">
                        {c.id}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-slate-300">{c.court}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <p><span className="text-slate-400">المدعي:</span> <span className="font-bold text-navy-900 dark:text-white">{c.plaintiff}</span></p>
                          <p><span className="text-slate-400">المدعى عليه:</span> <span className="font-bold text-navy-900 dark:text-white">{c.defendant}</span></p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-bold",
                          c.status === 'نشطة' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100" : 
                          c.status === 'تحت الدراسة' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100" : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-100"
                        )}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md w-fit",
                          c.najizReferenceStatus === 'مربوط بناجز' ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                        )}>
                          {c.najizReferenceStatus === 'مربوط بناجز' ? <Link2 size={12} /> : <Link2Off size={12} />}
                          {c.najizReferenceStatus}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <MemorandumsDialog caseData={c} />
                      </TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {c.najizReferenceStatus !== 'مربوط بناجز' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-[10px] font-bold border-primary-200 dark:border-white/10 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-white/5 gap-1"
                              onClick={() => handleLinkToNajiz(c.id)}
                            >
                              <Link2 size={12} />
                              ربط بناجز
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-navy-900 dark:hover:text-white">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-navy-800 dark:border-white/10 w-40">
                              <DropdownMenuItem onClick={() => {
                                setCaseToEdit(c);
                                setIsNewCaseOpen(true);
                              }} className="cursor-pointer dark:focus:bg-white/5 gap-2 flex items-center">
                                <Edit size={16} className="text-slate-500" />
                                <span>تعديل</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذه القضية؟")) {
                                  deleteCase(c.id);
                                  toast.success("تم حذف القضية بنجاح");
                                }
                              }} className="cursor-pointer text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 gap-2 flex items-center">
                                <Trash2 size={16} />
                                <span>حذف</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <TableRow className="bg-slate-50/30 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                          <TableCell colSpan={8} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <CaseDetailsPanel 
                                caseData={c} 
                                sessions={sessions} 
                                expenses={expenses} 
                                tasks={tasks} 
                                deadlines={deadlines}
                              />
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    لا توجد قضايا مطابقة للبحث أو معطيات مسجلة.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-navy-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              صفحة {currentPage} من {totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
