import { auth } from "@/lib/firebase";

async function callAiApi<T extends Record<string, unknown>>(path: string, payload: T): Promise<string> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("UNAUTHORIZED: يرجى تسجيل الدخول أولاً لاستخدام المساعد الذكي.");
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
    return (await callAiApi("/api/ai/legal-assistant", { userMessage, history })) || "عذراً، لم أتمكن من توليد رد حالياً.";
  } catch (error) {
    console.error("Gemini API Error");
    throw new Error("حدث خطأ أثناء الاتصال بالمستشار الذكي. يرجى المحاولة مرة أخرى.");
  }
}

export async function draftLegalDocument(type: string, facts: string) {
  try {
    return (await callAiApi("/api/ai/draft", { type, facts })) || "عذراً، لم أتمكن من صياغة الوثيقة.";
  } catch (error) {
    console.error("Gemini Drafting Error");
    throw new Error("حدث خطأ أثناء صياغة الوثيقة.");
  }
}

export async function analyzeLegalDocument(content: string) {
  try {
    return (await callAiApi("/api/ai/analyze", { content })) || "عذراً، لم أتمكن من تحليل الوثيقة.";
  } catch (error) {
    console.error("Gemini Analyze Error");
    throw new Error("حدث خطأ أثناء تحليل الوثيقة.");
  }
}
