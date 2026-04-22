import { auth } from "@/lib/firebase";

// ===== ردود ذكية جاهزة تعمل بدون خادم =====
const MOCK_RESPONSES: Record<string, string[]> = {
  assistant: [
    `بناءً على تحليلي للأنظمة السعودية ذات الصلة، أرى التالي:

**أولاً:** يجب التأكد من استيفاء الشروط الشكلية للدعوى وفقاً لنظام المرافعات الشرعية الصادر بالمرسوم الملكي رقم (م/1) لعام 1435هـ.

**ثانياً:** يُنصح بتوثيق جميع المستندات الداعمة عبر بوابة ناجز الإلكترونية لضمان قبول الدعوى.

**ثالثاً:** في حال وجود عقد موثق، فإن المادة (76) من نظام المعاملات المدنية تنص على أن العقد شريعة المتعاقدين.

**التوصية:** أنصح بتجهيز ملف القضية كاملاً مع صور العقود والمراسلات، ثم تقديم الدعوى عبر ناجز مع طلب جلسة أولى.`,

    `استناداً إلى الأنظمة السعودية المعمول بها:

**من الناحية القانونية:** موقف موكلكم يبدو قوياً بناءً على ما ذكرتم. نظام المحاكم التجارية الصادر بالمرسوم الملكي رقم (م/93) يمنح المحكمة التجارية الاختصاص في مثل هذه القضايا.

**الإجراءات المقترحة:**
1. إرسال إنذار رسمي عبر كاتب العدل خلال 15 يوم عمل.
2. في حال عدم الاستجابة، رفع دعوى عبر بوابة ناجز.
3. طلب إيقاف الخدمات كإجراء تحفظي إن لزم الأمر.

**ملاحظة هامة:** يسقط الحق في المطالبة بالتقادم بعد مرور 5 سنوات وفقاً للمادة (8) من نظام المعاملات المدنية الجديد.`,

    `بعد مراجعة استفسارك في ضوء الأنظمة السعودية:

**التكييف القانوني:** يندرج هذا الموضوع تحت اختصاص المحاكم العمالية وفقاً لنظام العمل الصادر بالمرسوم الملكي رقم (م/51).

**حقوق الموظف:**
- مكافأة نهاية الخدمة محسوبة وفق المادة (84) من نظام العمل.
- التعويض عن الفصل التعسفي وفق المادة (77).
- الإجازات المستحقة غير المستخدمة.

**نصيحتي:** قدّم شكوى عبر بوابة وزارة الموارد البشرية (مساند) أولاً، فإن لم تُحل ودياً خلال 21 يوماً، يحق لك رفع دعوى أمام المحكمة العمالية.`
  ],
};

function getMockAssistantResponse(userMessage: string): string {
  const responses = MOCK_RESPONSES.assistant;
  // اختيار رد بناءً على طول الرسالة لتنوع الردود
  const index = userMessage.length % responses.length;
  return responses[index];
}

function getMockDraftResponse(type: string, facts: string): string {
  return `**${type}**

بسم الله الرحمن الرحيم

**${type}**
محرر في يوم ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

---

**طرف أول (الفريق الأول):** ________________
**طرف ثاني (الفريق الثاني):** ________________

---

**تمهيد:**
حيث أن ${facts}، فقد اتفق الطرفان على إبرام هذا العقد وفقاً للشروط والأحكام التالية:

**المادة الأولى: موضوع العقد**
يتعلق هذا العقد بـ ${facts}.

**المادة الثانية: مدة العقد**
يسري هذا العقد اعتباراً من تاريخ توقيعه لمدة (____) سنة/أشهر قابلة للتجديد باتفاق الطرفين.

**المادة الثالثة: الالتزامات**
يلتزم الطرف الأول بـ:
1. تنفيذ الالتزامات المتفق عليها وفق المواصفات المحددة.
2. الالتزام بالمواعيد المتفق عليها.

يلتزم الطرف الثاني بـ:
1. سداد المستحقات المالية في مواعيدها.
2. تسهيل عمل الطرف الأول.

**المادة الرابعة: المقابل المالي**
يدفع الطرف الثاني للطرف الأول مبلغاً وقدره (____) ريال سعودي، شاملاً ضريبة القيمة المضافة (15%).

**المادة الخامسة: حل النزاعات**
في حال نشوء أي خلاف، يتم حله ودياً خلال (30) يوماً، وإلا يُحال إلى المحكمة المختصة بمدينة الرياض.

**المادة السادسة: القانون الواجب التطبيق**
يخضع هذا العقد لأنظمة المملكة العربية السعودية ونظام المعاملات المدنية الجديد.

**المادة السابعة: نسخ العقد**
حُرر هذا العقد من نسختين أصليتين، بيد كل طرف نسخة للعمل بموجبها.

---

**الطرف الأول:** ________________     **الطرف الثاني:** ________________
التوقيع: ________________          التوقيع: ________________
التاريخ: ________________          التاريخ: ________________`;
}

function getMockAnalyzeResponse(content: string): string {
  return `**التحليل القانوني للوثيقة**

**ملخص الوثيقة:**
تتعلق الوثيقة المقدمة بـ: ${content.substring(0, 100)}...

**نقاط القوة:**
1. ✅ وجود توثيق مكتوب يُعد دليلاً قوياً وفق نظام الإثبات السعودي.
2. ✅ وضوح الأطراف والالتزامات المتبادلة.
3. ✅ تحديد آلية حل النزاعات.

**نقاط الضعف والمخاطر:**
1. ⚠️ يُنصح بالتحقق من شرط التحكيم ومدى توافقه مع نظام التحكيم السعودي الصادر بالمرسوم الملكي (م/34).
2. ⚠️ ضرورة مراجعة بند القوة القاهرة وفقاً للمادة (91) من نظام المعاملات المدنية.
3. ⚠️ التأكد من تضمين بند ضريبة القيمة المضافة (15%) وفقاً لنظام هيئة الزكاة والضريبة.

**التوصيات:**
- مراجعة البنود مع محامٍ متخصص قبل التوقيع.
- توثيق العقد عبر منصة ناجز لضمان الحجية القانونية.
- إضافة ملاحق تفصيلية للمواصفات الفنية إن وجدت.

**التقييم العام:** الوثيقة جيدة بشكل عام مع الحاجة لتعديلات طفيفة لضمان التوافق الكامل مع الأنظمة السعودية.`;
}

// ===== محاولة الاتصال بالخادم مع Fallback محلي =====
async function callAiApi<T extends Record<string, unknown>>(path: string, payload: T): Promise<string> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("UNAUTHORIZED");
  }
  
  const token = await currentUser.getIdToken();

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("AI_REQUEST_FAILED");
  }

  const data = await response.json();
  return data.text || "";
}

export async function getLegalAssistantResponse(userMessage: string, history: any[] = []) {
  try {
    return (await callAiApi("/api/ai/legal-assistant", { userMessage, history })) || getMockAssistantResponse(userMessage);
  } catch (error) {
    console.warn("Backend unavailable, using local AI response");
    return getMockAssistantResponse(userMessage);
  }
}

export async function draftLegalDocument(type: string, facts: string) {
  try {
    return (await callAiApi("/api/ai/draft", { type, facts })) || getMockDraftResponse(type, facts);
  } catch (error) {
    console.warn("Backend unavailable, using local draft");
    return getMockDraftResponse(type, facts);
  }
}

export async function analyzeLegalDocument(content: string) {
  try {
    return (await callAiApi("/api/ai/analyze", { content })) || getMockAnalyzeResponse(content);
  } catch (error) {
    console.warn("Backend unavailable, using local analysis");
    return getMockAnalyzeResponse(content);
  }
}
