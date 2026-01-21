import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeCropPhoto = async (imageBuffer, cropInfo) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("Falta la configuración de la IA (API Key)");
    }

    const prompt = `Analiza esta planta de ${cropInfo.name}. Dame un JSON con: {"status": "Éxito/Advertencia", "diagnosis": "Salud detallada", "action": "Acción recomendada", "estimatedDaysToHarvest": 10, "estimatedHarvestDate": "YYYY-MM-DD"}`;
    const base64Data = imageBuffer.split(",")[1];

    // Lista de modelos ordenada por robustez y disponibilidad en v1beta
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-1.5-pro-latest"];
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
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                        ]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                })
            });

            if (response.status === 429) {
                throw new Error("Límite de uso alcanzado. Reintentando con otro modelo...");
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Error ${response.status}`);
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Respuesta de IA vacía");
            }

            const text = data.candidates[0].content.parts[0].text;
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.warn(`Fallo con modelo ${modelName}:`, error.message);
            lastError = error;
            // Si es un error de cuota (429), seguimos al siguiente modelo
            continue;
        }
    }

    throw lastError || new Error("No se pudo conectar con ningún modelo de IA");
};

export const analyzeGardenLayout = async (allCrops) => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : null;

    if (!apiKey || apiKey === 'tu_llave_de_google_gemini') {
        throw new Error("Falta la configuración de la IA (API Key)");
    }

    const layoutDescription = allCrops.reduce((acc, crop) => {
        const row = crop.rowNumber || 1;
        if (!acc[row]) acc[row] = [];
        acc[row].push(crop.name);
        return acc;
    }, {});

    const prompt = `
    Actúa como un experto agrónomo especialista en "Companion Planting" (asociación de cultivos).
    Analiza este diseño de huerto organizado por filas y dime:
    1. ¿Qué asociaciones son beneficiosas (amigos)?
    2. ¿Qué asociaciones son MUY MALAS (enemigos)?
    3. Sugerencias rápidas para mejorar el rendimiento.
    
    Diseño actual:
    ${Object.entries(layoutDescription).map(([row, plants]) => `Fila ${row}: ${plants.join(', ')}`).join('\n')}

    IMPORTANTE: Devuelve la respuesta en este formato JSON:
    {
      "friendships": ["Lista de buenas asociaciones encontradas..."],
      "warnings": ["Lista de conflictos encontrados..."],
      "tips": ["Consejos específicos para mejorar este diseño..."]
    }
  `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de IA (${response.status}): ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(`No se pudo analizar el diseño: ${error.message}`);
    }
};


