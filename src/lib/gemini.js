
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    // Trim the API key to avoid space errors
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    // Lista de modelos a probar en orden de preferencia (v6)
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Intentando modelo v6: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
        Eres un experto agrónomo. Analiza esta foto de un cultivo de ${cropInfo.name}.
        Datos: Plantado el ${cropInfo.plantedDate}, tipo ${cropInfo.type}.
        
        Dame un JSON con: status (Éxito/Advertencia), diagnosis (salud planta), action (qué hacer), estimatedDaysToHarvest (días que faltan), estimatedHarvestDate (fecha YYYY-MM-DD).
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
            console.warn(`Error en ${modelName}:`, error.message);
            lastError = error;
        }
    }

    throw lastError;
};
