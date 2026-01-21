
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Eres un experto agrónomo experto en IA. 
      Analiza esta foto de un cultivo de ${cropInfo.name} (${cropInfo.variety || 'variedad común'}).
      Datos del cultivo:
      - Fecha de plantación: ${cropInfo.plantedDate}
      - Tipo: ${cropInfo.type}
      
      Por favor, proporciona un análisis detallado que incluya:
      1. Diagnóstico de salud actual (vigor, color, posibles plagas).
      2. Estimación de cuánto tiempo le falta para la cosecha óptima (en días o fecha aproximada).
      3. Recomendación de acción inmediata (riego, abonado, poda, etc.).
      
      IMPORTANTE: Devuelve la respuesta EXCLUSIVAMENTE en formato JSON con esta estructura:
      {
        "status": "Éxito o Advertencia",
        "diagnosis": "Tu diagnóstico detallado aquí...",
        "action": "Acción recomendada corta",
        "estimatedDaysToHarvest": número de días,
        "estimatedHarvestDate": "YYYY-MM-DD"
      }
    `;

        // Convert base64 to parts for Gemini
        const base64Data = imageBuffer.split(",")[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean JSON if Gemini adds markdown
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};
