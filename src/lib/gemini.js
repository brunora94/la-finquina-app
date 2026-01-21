
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    // Debug info
    const keyInfo = `(KeyLen: ${apiKey.length}, Starts: ${apiKey.substring(0, 4)}...)`;

    const prompt = `
    Eres un experto agrónomo. Analiza esta foto de un cultivo de ${cropInfo.name}.
    Datos: Plantado el ${cropInfo.plantedDate}, tipo ${cropInfo.type}.
    
    Dame un JSON con: 
    {
      "status": "Éxito o Advertencia",
      "diagnosis": "Salud de la planta y vigor",
      "action": "Qué hacer ahora",
      "estimatedDaysToHarvest": días que faltan,
      "estimatedHarvestDate": "YYYY-MM-DD"
    }
  `;

    const base64Data = imageBuffer.split(",")[1];

    try {
        // LLAMADA DIRECTA POR REST (v7) - Saltamos el SDK
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google_Error_${response.status}: ${JSON.stringify(errorData)} ${keyInfo}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error en conexión directa:", error.message);
        throw new Error(`${error.message} ${keyInfo}`);
    }
};
