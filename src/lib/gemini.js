import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    const prompt = `Analiza esta planta de ${cropInfo.name}. Dame un JSON con: {"status": "Éxito o Advertencia", "diagnosis": "Salud planta", "action": "Qué hacer", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}`;

    const base64Data = imageBuffer.split(",")[1];

    try {
        // CONEXIÓN v8 (v1beta + modelo base)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Data } }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`v8_Error_${response.status}: ${errorData.error?.message || 'Unknown'}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(`(v8) ${error.message}`);
    }
};
