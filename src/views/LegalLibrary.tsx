import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Library, Search, FileText, Download, Tag, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useComplianceStore } from '@/store/useComplianceStore';
import { useState } from "react";

export default function LegalLibrary() {
  const precedents = useComplianceStore((state) => state.precedents);
  const addPrecedent = useComplianceStore((state) => state.addPrecedent);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">المكتبة القانونية</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">أرشفة المذكرات النموذجية، السوابق القضائية، والبحوث القانونية للمكتب.</p>
        </div>
        <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => setAddOpen(true)}>
          <FileText size={18} />
          إضافة مستند جديد
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg border-none shadow-2xl dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="font-bold">إضافة مستند إلى المكتبة</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title") || "").trim();
              const category = String(fd.get("category") || "").trim() || "عام";
              const summary = String(fd.get("summary") || "").trim();
              const tagsRaw = String(fd.get("tags") || "").trim();
              if (!title) {
                toast.error("أدخل عنوان المستند");
                return;
              }
              const tags = tagsRaw ? tagsRaw.split(/[,،]/).map((t) => t.trim()).filter(Boolean) : ["مكتبة"];
              addPrecedent({
                id: `LP-${Date.now()}`,
                title,
                category,
                summary: summary || "—",
                tags,
                date: new Date().toISOString().slice(0, 10),
              });
              toast.success("تمت إضافة المستند");
              setAddOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="lp-title">العنوان</Label>
              <Input id="lp-title" name="title" required placeholder="عنوان المذكرة أو السابقة" className="dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-cat">التصنيف</Label>
              <Input id="lp-cat" name="category" placeholder="مثال: تجاري، عمالي" className="dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-sum">ملخص</Label>
              <Textarea id="lp-sum" name="summary" placeholder="ملخص قصير" className="min-h-[100px] dark:bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lp-tags">وسوم (مفصولة بفاصلة)</Label>
              <Input id="lp-tags" name="tags" placeholder="تجاري، عقود" className="dark:bg-white/5" />
            </div>
            <Button type="submit" className="w-full bg-primary-600 text-white hover:bg-primary-700">
              حفظ
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input 
              placeholder="البحث في السوابق القضائية، المذكرات، أو التصنيفات..." 
              className="ps-10 h-12 bg-slate-50 dark:bg-white/5 border-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {precedents.map((precedent) => (
          <Card key={precedent.id} className="border-none shadow-sm dark:bg-navy-800 hover:ring-2 hover:ring-primary-500/20 transition-all group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-primary-600 border-primary-100 dark:border-primary-900/30">
                  {precedent.category}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={14} />
                  {precedent.date}
                </div>
              </div>
              <CardTitle className="text-lg font-bold mt-2 group-hover:text-primary-600 transition-colors">
                {precedent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {precedent.summary}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {precedent.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-500">
                    <Tag size={10} />
                    {tag}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-2 border-t border-slate-100 dark:border-white/5">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => toast.success("تم تنفيذ العملية")}>
                  <Download size={14} />
                  تحميل
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <ExternalLink size={14} />
                  عرض
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
