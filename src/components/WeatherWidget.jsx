import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { FARM_CONFIG } from '../constants';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const { lat, lon } = FARM_CONFIG.location;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
                );

                if (!response.ok) throw new Error('Failed to fetch weather');

                const data = await response.json();
                const current = data.current;
                const daily = data.daily;

                const getWeatherInfo = (code) => {
                    if (code === 0) return { condition: 'Despejado', icon: 'sun' };
                    if (code >= 1 && code <= 3) return { condition: 'Nublado', icon: 'cloudy' };
                    if (code >= 51 && code <= 67) return { condition: 'Lluvia', icon: 'rain' };
                    if (code >= 95) return { condition: 'Tormenta', icon: 'rain' };
                    return { condition: 'Variable', icon: 'cloudy' };
                };

                const info = getWeatherInfo(current.weather_code);

                setWeather({
                    temp: Math.round(current.temperature_2m),
                    condition: info.condition,
                    icon: info.icon,
                    humidity: current.relative_humidity_2m,
                    wind: Math.round(current.wind_speed_10m),
                    min: Math.round(daily.temperature_2m_min[0]),
                    max: Math.round(daily.temperature_2m_max[0])
                });
                setLoading(false);
            } catch (error) {
                console.error("Weather Error:", error);
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lon]);

    if (loading) return (
        <div className="card-premium h-64 flex items-center justify-center animate-pulse">
            <span className="text-nature-400">Obteniendo clima...</span>
        </div>
    );

    if (!weather) return (
        <div className="card-premium h-64 flex flex-col items-center justify-center text-red-500 gap-2">
            <span>⚠️ Error al conectar con el satélite</span>
        </div>
    );

    const getIcon = (icon) => {
        switch (icon) {
            case 'rain': return <CloudRain size={54} className="text-blue-400 animate-bounce" />;
            case 'cloudy': return <Cloud size={54} className="text-gray-400" />;
            default: return <Sun size={54} className="text-yellow-400 animate-spin-slow" />;
        }
    };

    return (
        <div className="card-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {getIcon(weather.icon)}
            </div>

            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-earth-500 font-medium mb-1 uppercase tracking-wider text-xs">Clima en tiempo real</h3>
                        <p className="text-nature-900 font-bold text-xl">{weather.condition}</p>
                    </div>
                    <div className="bg-nature-50 p-2 rounded-xl">
                        {getIcon(weather.icon)}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div className="text-center">
                        <span className="block text-6xl font-bold text-nature-800 tracking-tighter">{weather.temp}°</span>
                        <span className="text-[10px] text-earth-500 font-bold uppercase">Actual</span>
                    </div>
                    <div className="h-14 w-px bg-nature-100 mx-2"></div>
                    <div className="space-y-3">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-red-500">{weather.max}°</span>
                            <span className="text-[9px] text-earth-400 uppercase font-bold">Máx</span>
                        </div>
                        <div className="text-center border-t border-nature-50 pt-1">
                            <span className="block text-2xl font-bold text-blue-500">{weather.min}°</span>
                            <span className="text-[9px] text-earth-400 uppercase font-bold">Mín</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-3 rounded-2xl flex items-center gap-3 border border-blue-100/50">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Droplets size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <span className="block text-nature-900 font-bold leading-none">{weather.humidity}%</span>
                            <span className="text-[9px] text-earth-400 uppercase font-bold mt-1 block">Humedad</span>
                        </div>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100/50">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Wind size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <span className="block text-nature-900 font-bold leading-none">{weather.wind} km/h</span>
                            <span className="text-[9px] text-earth-400 uppercase font-bold mt-1 block">Viento</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
