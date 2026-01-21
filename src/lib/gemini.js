
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    // Lista de modelos a probar en orden de preferencia
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Intentando análisis con modelo: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

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
          "estimatedDaysToHarvest": 10,
          "estimatedHarvestDate": "YYYY-MM-DD"
        }
      `;

            const base64Data = imageBuffer.split(",")[1];
            const imagePart = {
                inlineData: { data: base64Data, mimeType: "image/jpeg" },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.warn(`Modelo ${modelName} falló:`, error.message);
            lastError = error;
            // Continuar al siguiente modelo...
        }
    }

    // Si llegamos aquí, todos fallaron
    throw lastError;
};
