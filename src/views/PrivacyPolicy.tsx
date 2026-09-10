import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6">
          <ArrowRight size={16} />
          العودة للصفحة الرئيسية
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 dark:text-white">سياسة الخصوصية</h1>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 mb-8">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            هذه مسودة أولية معدّة لأغراض الإطلاق فقط، وتحتاج <strong>مراجعة واعتماد من محامٍ سعودي مرخّص</strong> متخصص
            في نظام حماية البيانات الشخصية (PDPL) قبل الاعتماد عليها كوثيقة نهائية.
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="text-sm text-slate-500">آخر تحديث: {new Date().toLocaleDateString("ar-SA")}</p>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">1. البيانات التي نجمعها</h2>
            <ul className="list-disc pr-6 space-y-1">
              <li>بيانات حساب المستخدم: الاسم، البريد الإلكتروني، الدور الوظيفي.</li>
              <li>بيانات العملاء التي يُدخلها المكتب: الاسم، رقم الهوية/السجل التجاري، الرقم الضريبي، بيانات التواصل.</li>
              <li>بيانات القضايا والمستندات والملفات المالية التي يديرها المكتب داخل المنصة.</li>
              <li>بيانات تشغيلية محدودة (سجلات الدخول والعمليات) لأغراض الأمان والتدقيق.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">2. كيفية استخدام البيانات</h2>
            <p>
              تُستخدم البيانات حصراً لتقديم خدمات المنصة: عرض القضايا والفواتير، إرسال التنبيهات، معالجة الاشتراكات
              والفوترة، وتحسين الأمان والاستقرار. لا تُباع بيانات العملاء أو تُستخدم لأغراض إعلانية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">3. الحماية والتشفير</h2>
            <p>
              تُخزَّن الحقول الحساسة (رقم الهوية، السجل التجاري، الرقم الضريبي) مشفّرة في قاعدة البيانات، ويُفصل
              كل مكتب عن بيانات المكاتب الأخرى عبر سياسات عزل صارمة على مستوى القاعدة (Row-Level Security). يخضع
              الوصول للمنصة للمصادقة، وتُسجَّل العمليات الحساسة في سجل تدقيق دائم.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">4. الاحتفاظ بالبيانات والحذف</h2>
            <p>
              تُحذف السجلات القانونية والمالية (مثل الفواتير والقضايا) بأسلوب "الحذف المرن" (تُخفى ولا تُمحى فوراً)
              للامتثال لمتطلبات الاحتفاظ بالسجلات المهنية والمحاسبية، ويمكن حذفها نهائياً بناءً على طلب المكتب ضمن
              الحدود النظامية. عند إلغاء الاشتراك نهائياً، تُتاح فترة لتصدير البيانات قبل حذفها من خوادمنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">5. مزوّدو الخدمة الخارجيون</h2>
            <p>تعتمد المنصة على مزوّدين موثوقين لتشغيل بعض الخدمات، من ضمنهم:</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>Supabase — استضافة قاعدة البيانات والمصادقة وتخزين الملفات.</li>
              <li>Moyasar — معالجة المدفوعات (بيانات البطاقة لا تمر عبر خوادمنا مباشرة).</li>
              <li>مزوّد بريد إلكتروني معتمد لإرسال الإشعارات والفواتير.</li>
            </ul>
            <p className="mt-2">يخضع كل مزوّد لالتزامات تعاقدية بحماية البيانات وعدم استخدامها لأغراض أخرى.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">6. حقوقك على بياناتك</h2>
            <p>وفقاً لنظام حماية البيانات الشخصية السعودي، يحق لصاحب البيانات:</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>الاطلاع على بياناته المحفوظة لدى المنصة.</li>
              <li>طلب تصحيح البيانات غير الدقيقة.</li>
              <li>طلب حذف بياناته ضمن الحدود النظامية (مع مراعاة التزامات الاحتفاظ بالسجلات المهنية).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">7. التواصل</h2>
            <p>لأي استفسار أو طلب متعلق بالخصوصية، يرجى التواصل عبر البريد الإلكتروني الموضح في الصفحة الرئيسية.</p>
          </section>
        </article>
      </motion.div>
    </div>
  );
}
