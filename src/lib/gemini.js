import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    const prompt = `Actúa como agrónomo experto. Analiza esta planta de ${cropInfo.name}. Dame un JSON con: {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}`;
    const base64Data = imageBuffer.split(",")[1];

    const models = ["gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    let lastError = null;

    for (const modelName of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Data } }]
                    }]
                })
            });

            if (response.status === 429) {
                throw new Error("CUOTA_EXCEDIDA: Google está saturado, espera 1 minuto.");
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`404_${modelName}: ${errorData.error?.message || 'Not Found'}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.warn(`Fallo con ${modelName}:`, error.message);
            lastError = error;
            if (error.message.includes("CUOTA_EXCEDIDA")) break;
        }
    }

    throw new Error(`(v12) ${lastError.message}`);
};

