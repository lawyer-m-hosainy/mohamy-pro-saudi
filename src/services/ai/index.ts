/**
 * AI Service - الواجهة الرئيسية للذكاء الاصطناعي في التطبيق.
 * 
 * الهيكل:
 *   ai/
 *   ├── index.ts          ← أنت هنا (الواجهة العامة)
 *   ├── apiClient.ts      ← الاتصال بالخادم (Backend)
 *   └── mockResponses.ts  ← ردود احتياطية تعمل بدون خادم
 * 
 * كيف يعمل:
 *   1. يحاول الاتصال بالخادم (Backend) أولاً.
 *   2. إذا فشل (لا يوجد خادم أو لا يوجد مفتاح API) ← يُرجع رداً محلياً ذكياً.
 *   3. المستخدم لا يرى أي فرق — النظام يعمل دائماً.
 * 
 * للمستثمر:
 *   - لترقية الـ AI: فقط أضف GEMINI_API_KEY في إعدادات Render وشغّل الخادم.
 *   - لتغيير مزود الـ AI: عدّل apiClient.ts فقط.
 */

import { callAiApi } from "./apiClient";
import {
  getMockAssistantResponse,
  getMockDraftResponse,
  getMockAnalyzeResponse,
} from "./mockResponses";

export async function getLegalAssistantResponse(
  userMessage: string,
  history: any[] = []
): Promise<string> {
  try {
    const result = await callAiApi("/api/ai/legal-assistant", { userMessage, history });
    return result || getMockAssistantResponse(userMessage);
  } catch {
    console.warn("AI Backend unavailable → using local response");
    return getMockAssistantResponse(userMessage);
  }
}

export async function draftLegalDocument(
  type: string,
  facts: string
): Promise<string> {
  try {
    const result = await callAiApi("/api/ai/draft", { type, facts });
    return result || getMockDraftResponse(type, facts);
  } catch {
    console.warn("AI Backend unavailable → using local draft");
    return getMockDraftResponse(type, facts);
  }
}

export async function analyzeLegalDocument(
  content: string
): Promise<string> {
  try {
    const result = await callAiApi("/api/ai/analyze", { content });
    return result || getMockAnalyzeResponse(content);
  } catch {
    console.warn("AI Backend unavailable → using local analysis");
    return getMockAnalyzeResponse(content);
  }
}
