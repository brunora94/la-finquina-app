// El modelo más robusto y compatible con JSON en la actualidad
const STABLE_MODELS = ["gemini-1.5-flash"];

/**
 * Utilidad robusta para llamar a Gemini con reintentos automáticos
 */
const fetchGemini = async (modelName, payload, apiKey) => {
    // v1beta es el que mejor soporta response_mime_type: "application/json"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    // Forzamos que la IA siempre devuelva JSON si el modelo lo soporta
    const finalPayload = {
        ...payload,
        generationConfig: {
            ...payload.generationConfig,
            response_mime_type: "application/json"
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify(finalPayload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        const msg = errorData.error?.message || `Error ${response.status}`;
        throw { status: response.status, message: msg };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("La IA ha devuelto una respuesta vacía.");

    // Limpieza de posibles markdowns
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
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
                { text: `Analiza esta planta de ${cropInfo.name}. Dame un JSON con: {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}` },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
        }]
    };

    let lastError = null;
    for (const model of STABLE_MODELS) {
        try {
            console.log(`Intentando análisis con ${model}...`);
            return await fetchGemini(model, payload, apiKey);
        } catch (error) {
            console.error(`Fallo con ${model}:`, error.message);
            lastError = error;
            // Si es límite de cuota (429) o modelo no encontrado (404), probamos el siguiente
            if (error.status === 429 || error.status === 404) continue;
            // Para otros errores, también intentamos con el siguiente modelo para máxima resiliencia
            continue;
        }
    }

    throw new Error(lastError?.message || "No se pudo conectar con ningún modelo de IA de Google");
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

    const prompt = `
    Actúa como un experto agrónomo. Analiza este diseño de huerto: ${JSON.stringify(layout)}.
    IMPORTANTE: Devuelve un JSON con: {"friendships": [], "warnings": [], "tips": []}
    `;

    let lastError = null;
    for (const model of STABLE_MODELS) {
        try {
            return await fetchGemini(model, { contents: [{ parts: [{ text: prompt }] }] }, apiKey);
        } catch (error) {
            lastError = error;
            if (error.status === 429 || error.status === 404) continue;
            continue;
        }
    }

    throw new Error(lastError?.message || "No se pudo analizar el diseño del huerto");
};


