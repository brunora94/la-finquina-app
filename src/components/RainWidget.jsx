import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, Waves, Info, Lightbulb, AlertTriangle, CloudSun } from 'lucide-react';
import { FARM_CONFIG } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const RainWidget = () => {
    const [rainData, setRainData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { lat, lon } = FARM_CONFIG.location;

    useEffect(() => {
        const fetchRain = async () => {
            try {
                // Fetch 7 days of past rain + 2 days of forecast
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto&past_days=7`
                );

                if (!response.ok) throw new Error('Failed to fetch rain data');

                const data = await response.json();
                const daily = data.daily;

                // Open-Meteo returns history + forecast in order
                // With past_days=7, indices 0-6 are history, 7 is today, 8 is tomorrow
                const history = daily.precipitation_sum.slice(0, 7);
                const todayRain = daily.precipitation_sum[7] || 0;
                const tomorrowRain = daily.precipitation_sum[8] || 0;

                const totalPastRain = history.reduce((a, b) => a + (b || 0), 0);

                // Hydration level based on 25mm in 7 days as "Perfect"
                const hydrationLevel = Math.min((totalPastRain / 25) * 100, 100);

                // Smart Recommendation Logic
                let recommendation = {
                    title: "Riego Moderado",
                    message: "Suelo con humedad aceptable.",
                    type: "info",
                    color: "text-blue-600",
                    bg: "bg-blue-50"
                };

                if (todayRain > 2 || tomorrowRain > 2) {
                    recommendation = {
                        title: "Ahorra Agua",
                        message: `Previsión de lluvia (${(todayRain + tomorrowRain).toFixed(1)}mm). Deja que el cielo trabaje.`,
                        type: "success",
                        color: "text-green-600",
                        bg: "bg-green-50"
                    };
                } else if (hydrationLevel > 80) {
                    recommendation = {
                        title: "No Riegues",
                        message: "Suelo muy húmedo por lluvia reciente. Riesgo de asfixia radicular.",
                        type: "success",
                        color: "text-indigo-600",
                        bg: "bg-indigo-50"
                    };
                } else if (hydrationLevel < 30) {
                    recommendation = {
                        title: "Riego Urgente",
                        message: "Suelo muy seco y sin lluvia a la vista. Tus plantas necesitan agua hoy.",
                        type: "warning",
                        color: "text-orange-600",
                        bg: "bg-orange-50"
                    };
                } else if (hydrationLevel < 60) {
                    recommendation = {
                        title: "Toca Regar",
                        message: "La humedad está bajando. Un riego ligero vendría bien.",
                        type: "info",
                        color: "text-blue-600",
                        bg: "bg-blue-50"
                    };
                }

                setRainData({
                    history,
                    today: todayRain,
                    tomorrow: tomorrowRain,
                    totalPast: totalPastRain,
                    level: hydrationLevel,
                    recommendation
                });
                setLoading(false);
            } catch (error) {
                console.error("Rain Error:", error);
                setLoading(false);
            }
        };

        fetchRain();
    }, [lat, lon]);

    if (loading) return (
        <div className="card-premium h-full min-h-[220px] flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-3">
                <Waves className="text-blue-200 animate-bounce" size={40} />
                <span className="text-nature-400 font-medium font-outfit">Consultando Gurú...</span>
            </div>
        </div>
    );

    if (!rainData) return null;

    return (
        <div className="card-premium relative overflow-hidden group !p-0 border-blue-100 bg-white">
            {/* Status Header */}
            <div className={`py-2 px-4 text-center font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-sm transition-colors duration-500 ${rainData.recommendation.type === 'warning' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                    rainData.recommendation.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                {rainData.recommendation.title}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Waves className="text-blue-500" size={18} />
                            <h3 className="text-nature-900 font-bold text-lg font-outfit">Gurú del Riego</h3>
                        </div>
                        <p className="text-earth-400 text-[10px] font-black uppercase tracking-widest">Inteligencia Hídrica</p>
                    </div>
                </div>

                {/* Recommendation Card */}
                <div className={`mb-6 p-4 rounded-3xl border ${rainData.recommendation.bg} border-current/10 flex gap-4 items-start`}>
                    <div className={`p-2 bg-white rounded-xl shadow-sm ${rainData.recommendation.color}`}>
                        {rainData.recommendation.type === 'warning' ? <AlertTriangle size={20} /> : <Lightbulb size={20} />}
                    </div>
                    <div>
                        <p className={`text-xs font-black uppercase tracking-tight mb-0.5 ${rainData.recommendation.color}`}>Consejo del Gurú</p>
                        <p className="text-xs text-nature-800 font-medium leading-relaxed">{rainData.recommendation.message}</p>
                    </div>
                </div>

                {/* Hydration Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest">Humedad del Suelo</span>
                        <span className="text-lg font-black text-blue-600 leading-none">{Math.round(rainData.level)}%</span>
                    </div>
                    <div className="relative h-4 bg-blue-50 rounded-full overflow-hidden border border-blue-100/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${rainData.level}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full relative ${rainData.level < 30 ? 'bg-orange-400' :
                                    rainData.level < 60 ? 'bg-blue-400' :
                                        'bg-blue-600'
                                }`}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-[2px]" />
                        </motion.div>
                    </div>
                </div>

                {/* 7 Day History Mini Chart */}
                <div className="space-y-3">
                    <p className="text-[9px] font-black text-earth-300 uppercase tracking-widest text-center">Últimos 7 días (mm)</p>
                    <div className="flex justify-between items-end h-12 gap-1 px-1">
                        {rainData.history.map((mm, idx) => (
                            <div key={idx} className="flex-1 group/bar relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min((mm / 10) * 100, 100)}%` }}
                                    className={`w-full rounded-t-lg transition-all duration-300 ${mm > 0 ? 'bg-blue-400' : 'bg-nature-100'}`}
                                />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-nature-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                    {mm.toFixed(1)} mm
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Forecast Summary */}
                <div className="mt-6 pt-4 border-t border-nature-50 flex justify-between">
                    <div className="flex items-center gap-2">
                        <CloudSun size={14} className="text-earth-400" />
                        <span className="text-[10px] font-bold text-earth-400 uppercase">Previsión:</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <span className="block text-[8px] font-black text-earth-300 uppercase">Hoy</span>
                            <span className={`text-xs font-black ${rainData.today > 0 ? 'text-blue-600' : 'text-nature-400'}`}>{rainData.today.toFixed(1)}mm</span>
                        </div>
                        <div className="text-right border-l border-nature-50 pl-4">
                            <span className="block text-[8px] font-black text-earth-300 uppercase">Mañana</span>
                            <span className={`text-xs font-black ${rainData.tomorrow > 0 ? 'text-blue-600' : 'text-nature-400'}`}>{rainData.tomorrow.toFixed(1)}mm</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none transform rotate-12">
                <Droplets size={120} className="text-blue-500" />
            </div>
        </div>
    );
};

export default RainWidget;
