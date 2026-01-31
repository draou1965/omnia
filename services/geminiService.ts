
import { GoogleGenAI } from "@google/genai";
import { CompetencyAssessment, AssessmentStatus } from "../types";

// Pedagogical assistant service for kindergarten management
export const generatePedagogicalResponse = async (prompt: string, context?: string) => {
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "عذراً، أواجه صعوبة تقنية في توليد الإجابة. يرجى المحاولة لاحقاً.";
  }
};

export const generateStudentReportComment = async (studentName: string, section: string, assessments: CompetencyAssessment) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const statusMap: Record<AssessmentStatus, string> = {
    acquired: "مكتسب",
    ongoing: "في طور الاكتساب",
    not_acquired: "غير مكتسب بعد"
  };

  const context = `
    اسم الطفل: ${studentName}
    المستوى: ${section}
    النتائج الحالية:
    - اللغة والتواصل: ${statusMap[assessments.language]}
    - المنطق والرياضيات: ${statusMap[assessments.math]}
    - السلوك والقيم: ${statusMap[assessments.social]}
    - الحس-حركي: ${statusMap[assessments.motor]}
    - التعبير الفني: ${statusMap[assessments.art]}
  `;

  const prompt = `بناءً على النتائج أعلاه، اكتب ملاحظة تربوية موجزة (3-4 جمل) لولي الأمر تصف تطور الطفل ونقاط القوة مع نصيحة بسيطة للبيت. استخدم لغة مشجعة ومهنية باللغة العربية.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "أنت مستشار تربوي متخصص في التعليم الأولي. هدفك كتابة ملاحظات دقيقة ومشجعة لنتائج الدورة الدراسية.",
        temperature: 0.5,
      },
    });
    return response.text;
  } catch (error) {
    return "يظهر الطفل مجهوداً طيباً في أنشطة الفصل، ونوصي بالاستمرار في تشجيعه بالمنزل.";
  }
};
