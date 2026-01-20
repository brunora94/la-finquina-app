export const FARM_CONFIG = {
    name: "La Finquina",
    location: {
        lat: 43.435136,
        lon: -5.684696
    }
};

export const API_KEYS = {
    // Use environment variables in production, placeholders for now
    OPENWEATHER: import.meta.env.VITE_OPENWEATHER_API_KEY || "demo_key"
};
