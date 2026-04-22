import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileSearch, ListChecks, Scale, Loader2, Download, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { analyzeLegalDocument } from "@/services/ai";

export default function AIDocumentAnalyzer() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("يرجى إدخال نص الوثيقة للتحليل");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeLegalDocument(content);
      setAnalysis(result);
      toast.success("تم تحليل الوثيقة بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل التحليل. تأكد من إعداد Gemini API.");
    } finally {
      setIsAnalyzing(false);
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
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">المحلل القانوني الذكي</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">تحليل اللوائح، الأحكام، والمذكرات القانونية باستخدام الذكاء الاصطناعي لاستخراج الدفوع والثغرات.</p>
        </div>
        <Badge className="bg-accent-500 text-navy-900 font-bold px-3 py-1">مدعوم بـ Gemini AI</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm dark:bg-navy-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileSearch size={20} className="text-primary-500" />
              نص الوثيقة
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea 
              placeholder="قم بلصق نص لائحة الدعوى، صك الحكم، أو أي وثيقة قانونية هنا..." 
              className="flex-1 min-h-[400px] bg-slate-50 dark:bg-white/5 border-none resize-none p-4 leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button 
              className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 gap-2"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              بدء التحليل الذكي
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-navy-800 flex flex-col">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ListChecks size={20} className="text-emerald-500" />
              نتائج التحليل
            </CardTitle>
            {analysis && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Copy size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Download size={16} /></Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-y-auto max-h-[550px]">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500">
                <Loader2 size={48} className="animate-spin text-primary-500" />
                <p className="animate-pulse">جاري قراءة النص واستخراج الدفوع القانونية...</p>
              </div>
            ) : analysis ? (
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap leading-loose text-slate-700 dark:text-slate-300">
                  {analysis}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
                <Scale size={64} className="opacity-10" />
                <p>بانتظار إدخال النص لبدء التحليل واستخراج الرؤى القانونية</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
