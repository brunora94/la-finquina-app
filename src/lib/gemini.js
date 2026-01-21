
/**
 * Motor de IA de La Finquina usando el endpoint de PRODUCCIÓN (v1).
 * Esta es la versión más compatible: v1 + gemini-1.5-flash.
 * Usamos fetch directo para evitar que las librerías fuercen versiones beta.
 */

const callGeminiV1 = async (payload, apiKey) => {
    // Usamos v1 (Estable) y el modelo 1.5-flash (Estándar de Google)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error?.message || `Error ${response.status}`;
        console.error("Gemini API Error:", errorData);
        throw new Error(errorMsg);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("La IA no ha devuelto respuesta.");

    // Limpieza robusta de JSON (quitando posibles bloques de código markdown)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Error parseando JSON de IA:", text);
        throw new Error("La respuesta de la IA no tiene un formato válido.");
    }
};

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    const base64Data = imageBuffer.split(",")[1];
    const payload = {
        contents: [{
            parts: [
                {
                    text: `Analiza esta planta de ${cropInfo.name}. 
                Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin explicaciones) que tenga este formato exacto:
                {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}` },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
        }],
        generationConfig: {
            temperature: 0.4,
            topP: 1,
            topK: 32,
            maxOutputTokens: 1024,
        }
    };

    return await callGeminiV1(payload, apiKey);
};

export const analyzeGardenLayout = async (allCrops) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("API_KEY_MISSING");
    }

    const layout = allCrops.reduce((acc, crop) => {
        const row = crop.row_number || 1;
        if (!acc[row]) acc[row] = [];
        acc[row].push(crop.name);
        return acc;
    }, {});

    const payload = {
        contents: [{
            parts: [{
                text: `Actúa como agrónomo experto. Analiza este huerto: ${JSON.stringify(layout)}. 
                Responde ÚNICAMENTE con un objeto JSON (sin markdown) que tenga este formato exacto:
                {"friendships": ["lista de asociaciones positivas"], "warnings": ["lista de conflictos"], "tips": ["consejos de mejora"]}`
            }]
        }],
        generationConfig: {
            temperature: 0.2,
            topP: 1,
            maxOutputTokens: 1024,
        }
    };

    return await callGeminiV1(payload, apiKey);
};
