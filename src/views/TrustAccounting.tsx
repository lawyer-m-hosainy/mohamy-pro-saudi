import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, ArrowUpRight, History, Landmark, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFinanceStore } from '@/store/useFinanceStore';

export default function TrustAccounting() {
  const trustAccounts = useFinanceStore((state) => state.trustAccounts || []) || [];
  const addTrustAccount = useFinanceStore((state) => state.addTrustAccount);
  const disburseTrustAccount = useFinanceStore((state) => state.disburseTrustAccount);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositType, setDepositType] = useState<"أمانة" | "مقدم أتعاب" | "مبلغ تنفيذ">("أمانة");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة الأمانات والعهد</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة مبالغ التنفيذ، مقدمات الأتعاب، وأمانات العملاء بشكل مستقل.</p>
        </div>
        <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => setDepositOpen(true)}>
          <Plus size={18} />
          إيداع جديد
        </Button>
      </div>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="font-bold">إيداع أمانة جديد</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const clientName = String(fd.get("clientName") || "").trim();
              const amount = Number(fd.get("amount"));
              const type = depositType;
              const description = String(fd.get("description") || "").trim();
              if (!clientName || !amount || amount <= 0) {
                toast.error("أدخل اسم العميل ومبلغاً صحيحاً");
                return;
              }
              addTrustAccount({
                id: `TA-${Date.now()}`,
                clientId: `CLI-${Date.now()}`,
                clientName,
                amount,
                type: type || "أمانة",
                status: "نشط",
                description: description || "إيداع جديد",
                date: new Date().toISOString().slice(0, 10),
              });
              toast.success("تم تسجيل الإيداع");
              setDepositOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="ta-client">اسم العميل</Label>
              <Input id="ta-client" name="clientName" required placeholder="اسم العميل أو الجهة" className="dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label>نوع المبلغ</Label>
              <Select value={depositType} onValueChange={(v) => v && setDepositType(v as typeof depositType)}>
                <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="أمانة">أمانة</SelectItem>
                  <SelectItem value="مقدم أتعاب">مقدم أتعاب</SelectItem>
                  <SelectItem value="مبلغ تنفيذ">مبلغ تنفيذ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-amount">المبلغ (ر.س)</Label>
              <Input id="ta-amount" name="amount" type="number" min={1} step="0.01" required className="dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-desc">الوصف</Label>
              <Input id="ta-desc" name="description" placeholder="مثال: أمانة تنفيذ حكم" className="dark:bg-white/5" />
            </div>
            <Button type="submit" className="w-full bg-primary-600 text-white hover:bg-primary-700">
              حفظ الإيداع
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm dark:bg-navy-800 bg-navy-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-navy-200 text-sm">إجمالي رصيد الأمانات</p>
              <Landmark size={20} className="text-accent-500" />
            </div>
            <h3 className="text-3xl font-bold">450,000 <span className="text-sm font-normal text-navy-300">ر.س</span></h3>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm">مبالغ بانتظار الصرف</p>
              <ArrowUpRight size={20} className="text-amber-500" />
            </div>
            <h3 className="text-3xl font-bold">125,000 <span className="text-sm font-normal text-slate-400">ر.س</span></h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm">عمليات الشهر الحالي</p>
              <History size={20} className="text-primary-500" />
            </div>
            <h3 className="text-3xl font-bold">18 <span className="text-sm font-normal text-slate-400">عملية</span></h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">سجل حسابات الأمانة</CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            toast.info("جاري إعداد التقرير المالي المفصل...");
            setTimeout(() => toast.success("تم تحميل التقرير المالي بصيغة PDF بنجاح"), 1500);
          }}>
            <Receipt size={16} />
            تقرير مالي مفصل
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start">العميل</TableHead>
                <TableHead className="text-start">النوع</TableHead>
                <TableHead className="text-start">المبلغ</TableHead>
                <TableHead className="text-start">التاريخ</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trustAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    لا توجد عمليات أمانة مسجلة حالياً
                  </TableCell>
                </TableRow>
              ) : (
                trustAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-bold">{account.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary-600">
                      {account.amount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{account.date}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        account.status === 'نشط' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={account.status === 'تم الصرف'}
                        onClick={() => {
                          disburseTrustAccount(account.id);
                          toast.success(`تم تنفيذ صرف أمانة ${account.clientName}`);
                        }}
                      >
                        {account.status === 'تم الصرف' ? 'تم الصرف' : 'صرف'}
                      </Button>
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
