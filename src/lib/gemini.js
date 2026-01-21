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

    try {
        // CONEXIÓN v11 (Gemini 1.5 Flash + v1beta + Header Auth)
        // Usamos v1beta porque es la ruta que llegó a conectar en la v9
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`v11_Error_${response.status}_${errorData.error?.message || 'Unknown'}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(`(v11) ${error.message}`);
    }
};
