import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Motor de IA de La Finquina usando la librería oficial de Google.
 * Esta versión es la más robusta y compatible con todos los ambientes.
 */

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // El modelo flash es el más rápido y estable para visión
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const base64Data = imageBuffer.split(",")[1];
        const prompt = `Analiza esta planta de ${cropInfo.name}. Dame un JSON con: {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]);

        const response = await result.response;
        const text = response.text();
        return JSON.parse(text);

    } catch (error) {
        console.error("Error crítico en análisis de foto:", error);
        throw new Error(error.message || "Error al conectar con la IA de Google");
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
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const layout = allCrops.reduce((acc, crop) => {
            const row = crop.row_number || 1;
            if (!acc[row]) acc[row] = [];
            acc[row].push(crop.name);
            return acc;
        }, {});

        const prompt = `Actúa como agrónomo. Analiza este huerto: ${JSON.stringify(layout)}. Devuelve un JSON con: {"friendships": [], "warnings": [], "tips": []}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        console.error("Error crítico en análisis de diseño:", error);
        throw new Error(error.message || "Error al analizar el diseño del huerto");
    }
};
