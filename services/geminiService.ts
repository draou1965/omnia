
import { GoogleGenAI } from "@google/genai";

// Pedagogical assistant service for kindergarten management
export const generatePedagogicalResponse = async (prompt: string, context?: string) => {
  // Always initialize GoogleGenAI with a named parameter for the API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    أنت مساعد خبير لجمعية الأمنية للتعليم الأولي.
    دورك هو مساعدة المدير أو المديرة في المهام اليومية:
    1. كتابة رسائل لأولياء الأمور باللغة العربية الفصحى.
    2. تقديم نصائح تربوية للمعلمات (أقسام: الحضانة الصغرى، القسم الأصغر، الأوسط، الأكبر).
    3. إدارة النزاعات أو المواقف الحساسة مع الأطفال أو الأهل.
    4. تنظيم الفعاليات الخاصة بالجمعية.
    
    يجب أن تكون مهنياً، متعاطفاً، وتستخدم لغة تناسب الوسط التعليمي.
    سياق المؤسسة: جمعية الأمنية للتعليم الأولي، تضم 48 معلمة، وحوالي 1200 طفل.
    أجب دائماً باللغة العربية ما لم يطلب منك غير ذلك.
    ${context ? `سياق محدد: ${context}` : ""}
  `;

  try {
    // Using gemini-3-flash-preview for general pedagogical text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    // Direct access to the .text property of GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "عذراً، أواجه صعوبة تقنية في توليد الإجابة. يرجى المحاولة لاحقاً.";
  }
};
