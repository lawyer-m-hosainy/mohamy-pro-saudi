/**
 * AI Service - الواجهة الرئيسية للذكاء الاصطناعي في التطبيق.
 *
 * الهيكل:
 *   ai/
 *   ├── index.ts          ← أنت هنا (الواجهة العامة)
 *   └── apiClient.ts      ← الاتصال بالخادم (Backend)
 *
 * لا يوجد رد احتياطي وهمي: إذا فشل الاتصال بالخادم، تُرمى الحالة كخطأ
 * ليتعامل معه المستخدم في الواجهة (رسالة خطأ واضحة)، بدلاً من عرض نص
 * قانوني ثابت يبدو وكأنه تحليل حقيقي لسؤال المستخدم — وهذا خطير في
 * منصة قانونية يعتمد عليها محامون في قرارات فعلية.
 *
 * للمستثمر:
 *   - لتفعيل الـ AI: أضف GEMINI_API_KEY في إعدادات الخادم وشغّله.
 *   - لتغيير مزود الـ AI: عدّل apiClient.ts فقط.
 */

import { callAiApi } from "./apiClient";

export async function getLegalAssistantResponse(
  userMessage: string,
  history: any[] = []
): Promise<string> {
  return callAiApi("/api/ai/legal-assistant", { userMessage, history });
}

export async function draftLegalDocument(
  type: string,
  facts: string
): Promise<string> {
  return callAiApi("/api/ai/draft", { type, facts });
}

export async function analyzeLegalDocument(
  content: string
): Promise<string> {
  return callAiApi("/api/ai/analyze", { content });
}
