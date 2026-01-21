import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Motor de IA de La Finquina usando el endpoint estable de Google.
 * Eliminamos responseMimeType para maximizar compatibilidad con todas las regiones.
 */

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Usamos gemini-1.5-flash que es el estándar más compatible
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const base64Data = imageBuffer.split(",")[1];
        const prompt = `Analiza esta planta de ${cropInfo.name}. 
        IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin explicaciones) que tenga este formato:
        {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]);

        const response = await result.response;
        const text = response.text();

        // Limpieza robusta del JSON por si la IA añade markdown
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Error en análisis de foto:", error);
        throw new Error("No se pudo conectar con la IA. Verifica que tu API Key sea correcta y tenga permisos para Gemini 1.5 Flash.");
    }
};

export const analyzeGardenLayout = async (allCrops) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const layout = allCrops.reduce((acc, crop) => {
            const row = crop.row_number || 1;
            if (!acc[row]) acc[row] = [];
            acc[row].push(crop.name);
            return acc;
        }, {});

        const prompt = `Actúa como agrónomo. Analiza este huerto: ${JSON.stringify(layout)}. 
        IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON (sin markdown) que tenga este formato:
        {"friendships": [], "warnings": [], "tips": []}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Error en análisis de diseño:", error);
        throw new Error("Error al analizar el diseño del huerto con la IA.");
    }
};
