import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfService() {
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
            <Scale className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 dark:text-white">الشروط والأحكام</h1>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 mb-8">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            هذه مسودة أولية معدّة لأغراض الإطلاق فقط، وتحتاج <strong>مراجعة واعتماد من محامٍ سعودي مرخّص</strong> قبل
            الاعتماد عليها كوثيقة تعاقدية فعلية مع المشتركين. لا تُستخدم بصيغتها الحالية كأساس قانوني نهائي.
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="text-sm text-slate-500">آخر تحديث: {new Date().toLocaleDateString("ar-SA")}</p>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">1. قبول الشروط</h2>
            <p>
              باستخدامك منصة "ملف" (يُشار إليها بـ"المنصة") لإدارة أعمال مكتبك القانوني، فإنك توافق على هذه الشروط
              والأحكام بالكامل. إذا كنت لا توافق عليها، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">2. وصف الخدمة</h2>
            <p>
              المنصة عبارة عن نظام سحابي (SaaS) لإدارة القضايا والعملاء والشؤون المالية والامتثال لمكاتب المحاماة
              والاستشارات القانونية. المنصة أداة إدارية، ولا تُعد بديلاً عن الاستشارة القانونية المتخصصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">3. حساب المكتب والاشتراك</h2>
            <ul className="list-disc pr-6 space-y-1">
              <li>يتحمل مكتب المحاماة (المشترك) مسؤولية دقة البيانات التي يُدخلها وصحة صلاحيات مستخدميه.</li>
              <li>تتم عمليات الدفع والفوترة عبر بوابة دفع سعودية معتمدة (Moyasar)، ويخضع تجديد الاشتراك وإلغاؤه للخطة المُختارة.</li>
              <li>يحق للمنصة تعليق الحساب عند التأخر في السداد أو الإخلال الجسيم بهذه الشروط، مع إشعار مسبق حيثما أمكن.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">4. ملكية البيانات</h2>
            <p>
              تبقى جميع بيانات العملاء والقضايا والمستندات التي يُدخلها المكتب ملكاً خالصاً لذلك المكتب. لا تستخدم
              المنصة هذه البيانات لأي غرض غير تقديم الخدمة، ولا تشاركها مع أي جهة خارجية إلا وفق سياسة الخصوصية
              أو بأمر نظامي.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">5. الذكاء الاصطناعي</h2>
            <p>
              أي ردود أو مسودات أو تحليلات يولّدها المساعد الذكي داخل المنصة هي أداة مساعدة فقط، ولا تُعد استشارة
              قانونية معتمدة ولا تُغني عن مراجعة محامٍ مختص قبل الاعتماد عليها في أي إجراء فعلي.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">6. الاستخدام المحظور</h2>
            <p>
              يُحظر استخدام المنصة لأي غرض مخالف للأنظمة السعودية، أو محاولة اختراق أمنها، أو الوصول لبيانات مكاتب
              أخرى، أو إساءة استخدام الحسابات المشتركة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">7. حدود المسؤولية</h2>
            <p>
              تُقدَّم المنصة "كما هي"، وتُبذل جهود معقولة لضمان استمراريتها ودقتها، دون أي ضمان قانوني بخلوّها التام
              من الأخطاء أو الانقطاع. لا تتحمل المنصة مسؤولية القرارات القانونية أو المهنية المبنية على استخدامها.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">8. إنهاء الخدمة</h2>
            <p>
              يجوز لأي طرف إنهاء الاشتراك وفق سياسة الإلغاء المعلنة. عند الإنهاء، يُتاح للمكتب تصدير بياناته خلال
              مدة معقولة قبل حذفها نهائياً من المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">9. القانون الواجب التطبيق</h2>
            <p>تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية، وتختص محاكمها بالفصل في أي نزاع.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">10. التواصل</h2>
            <p>لأي استفسار بخصوص هذه الشروط، يرجى التواصل عبر البريد الإلكتروني الموضح في الصفحة الرئيسية.</p>
          </section>
        </article>
      </motion.div>
    </div>
  );
}
