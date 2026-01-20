import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, Waves, Info } from 'lucide-react';
import { FARM_CONFIG } from '../constants';
import { motion } from 'framer-motion';

const RainWidget = () => {
    const [rainData, setRainData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { lat, lon } = FARM_CONFIG.location;

    useEffect(() => {
        const fetchRain = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto&past_days=3`
                );

                if (!response.ok) throw new Error('Failed to fetch rain data');

                const data = await response.json();
                const daily = data.daily;

                const last3DaysRain = daily.precipitation_sum.slice(0, 3);
                const totalRain = last3DaysRain.reduce((a, b) => a + (b || 0), 0);

                // Hydration progress (0 to 100)
                // Assuming 15mm in 3 days is "Perfectly Hydrated" (100%)
                const hydrationLevel = Math.min((totalRain / 15) * 100, 100);
                const irrigationNeeded = totalRain < 5;

                setRainData({
                    history: last3DaysRain,
                    total: totalRain,
                    needed: irrigationNeeded,
                    level: hydrationLevel
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
                <span className="text-nature-400 font-medium">Analizando suelo...</span>
            </div>
        </div>
    );

    if (!rainData) return null;

    return (
        <div className="card-premium relative overflow-hidden group !p-0 border-blue-100 bg-white">
            {/* Status Header with Dynamic Gradient */}
            <div className={`py-2 px-4 text-center font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-sm transition-colors duration-500 ${rainData.needed ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                {rainData.needed ? '⚠️ SECO: Toca regar' : '💧 ÓPTIMO: Suelo húmedo'}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Waves className="text-blue-500" size={18} />
                            <h3 className="text-nature-900 font-bold text-lg font-outfit">Humedad Suelo</h3>
                        </div>
                        <p className="text-earth-400 text-xs font-medium">Basado en lluvia reciente</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-blue-600 leading-none">{Math.round(rainData.level)}%</span>
                        <span className="text-[9px] font-bold text-earth-300 uppercase mt-1">Nivel hídrico</span>
                    </div>
                </div>

                {/* Hydration Circular Progress / Bar */}
                <div className="relative h-4 bg-blue-50 rounded-full mb-8 overflow-hidden border border-blue-100/50">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rainData.level}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full relative ${rainData.level < 30 ? 'bg-orange-400' : rainData.level < 60 ? 'bg-blue-400' : 'bg-blue-600'
                            }`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-[2px]" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    {rainData.history.map((mm, idx) => (
                        <div key={idx} className="bg-nature-50/50 rounded-2xl p-2 border border-nature-100/50 flex flex-col items-center">
                            <span className="text-[9px] font-bold text-earth-400 uppercase mb-1">
                                {idx === 0 ? '-3 días' : idx === 1 ? '-2 días' : 'Ayer'}
                            </span>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-sm font-black text-blue-700">{mm.toFixed(1)}</span>
                                <span className="text-[8px] font-bold text-blue-400 uppercase">mm</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50/40 p-3 rounded-2xl flex items-center justify-between border border-blue-100/30">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <CloudRain size={14} className="text-blue-500" />
                        </div>
                        <span className="text-[11px] font-bold text-nature-700">Auditado Local</span>
                    </div>
                    <span className="text-xs font-black text-blue-800 bg-white px-2 py-0.5 rounded-md shadow-sm border border-blue-100">
                        {rainData.total.toFixed(1)} mm total
                    </span>
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
