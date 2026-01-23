import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets,
    Waves,
    ArrowDownTray,
    ArrowUpTray,
    ChevronLeft,
    Zap,
    Info,
    AlertTriangle,
    CheckCircle2,
    CloudRain,
    BarChart3,
    Settings,
    Beaker
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FARM_CONFIG } from '../constants';
import clsx from 'clsx';

const WATER_NEEDS = {
    'huerto': { // L/day per plant avg
        'Tomate': 2.5,
        'Lechuga': 0.8,
        'Cebolla': 0.5,
        'Pimiento': 2.0,
        'default': 1.0
    },
    'frutal': { // L/day per tree avg
        'Manzano': 15,
        'Peral': 15,
        'Cerezo': 12,
        'Limonero': 20,
        'default': 15
    }
};

const WaterControl = ({ onBack }) => {
    const [crops, setCrops] = useState([]);
    const [tankLevel, setTankLevel] = useState(750); // Liters
    const [tankCapacity, setTankCapacity] = useState(1000); // Liters
    const [rainForecast, setRainForecast] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // Load Crops
            const { data: cropsData } = await supabase.from('crops').select('*');
            if (cropsData) setCrops(cropsData);

            // Fetch Rain Forecast (Tomorrow)
            try {
                const { lat, lon } = FARM_CONFIG.location;
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto`
                );
                const data = await response.json();
                setRainForecast(data.daily.precipitation_sum[1] || 0);
            } catch (e) { console.error(e); }

            // Load Tank Info from LocalStorage (Simple for now)
            const savedTank = localStorage.getItem('finquina_tank');
            if (savedTank) {
                const parsed = JSON.parse(savedTank);
                setTankLevel(parsed.level);
                setTankCapacity(parsed.capacity);
            }

            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        localStorage.setItem('finquina_tank', JSON.stringify({ level: tankLevel, capacity: tankCapacity }));
    }, [tankLevel, tankCapacity]);

    const calculateTotalNeed = () => {
        return crops.reduce((acc, crop) => {
            const needPerPlant = WATER_NEEDS[crop.type]?.[crop.name] || WATER_NEEDS[crop.type]?.default || 1;
            return acc + (needPerPlant * (crop.quantity || 1));
        }, 0);
    };

    const totalNeed = calculateTotalNeed();
    const effectiveNeed = Math.max(0, totalNeed - (rainForecast * 5)); // Estimate 5m2 catchment or reduction
    const daysAvailable = totalNeed > 0 ? Math.floor(tankLevel / totalNeed) : Infinity;

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 px-2">
                <button
                    onClick={onBack}
                    className="p-3 bg-white rounded-2xl border border-nature-100 shadow-sm text-nature-600 active:scale-90 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight leading-none">Hidro-Control</h2>
                    <span className="text-[10px] font-black text-earth-300 uppercase tracking-widest">Gestión de Depósitos</span>
                </div>
            </div>

            {/* Tank Visualization Card */}
            <div className="px-2">
                <div className="bg-white rounded-[3rem] border border-nature-100 shadow-xl overflow-hidden p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black text-earth-300 uppercase tracking-widest mb-1">Estado del Depósito</p>
                            <h3 className="text-4xl font-black font-outfit text-nature-900 leading-none">
                                {tankLevel}L <span className="text-earth-200 text-xl font-bold">/ {tankCapacity}L</span>
                            </h3>
                        </div>
                        <div className={clsx(
                            "px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm",
                            tankLevel / tankCapacity > 0.3 ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                        )}>
                            {Math.round((tankLevel / tankCapacity) * 100)}% Lleno
                        </div>
                    </div>

                    {/* Animated Tank Visualizer */}
                    <div className="relative h-64 w-full bg-nature-50 rounded-[2.5rem] border-4 border-nature-100 overflow-hidden group">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(tankLevel / tankCapacity) * 100}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-600 to-blue-400"
                        >
                            {/* Waves Decoration */}
                            <div className="absolute top-0 inset-x-0 h-4 overflow-hidden -translate-y-full opacity-30">
                                <div className="absolute inset-0 bg-blue-300 animate-wave-slow" />
                                <div className="absolute inset-0 bg-blue-200 animate-wave-fast translate-y-1" />
                            </div>
                        </motion.div>

                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-10">
                            <Waves className="text-white/40 mb-2" size={40} />
                        </div>
                    </div>

                    {/* Level Controls */}
                    <div className="mt-8 space-y-4">
                        <label className="text-[10px] font-black text-earth-300 uppercase tracking-widest pl-1">Ajustar Nivel Actual</label>
                        <input
                            type="range"
                            min="0"
                            max={tankCapacity}
                            value={tankLevel}
                            onChange={(e) => setTankLevel(parseInt(e.target.value))}
                            className="w-full h-3 bg-nature-50 rounded-full appearance-none cursor-pointer accent-blue-600 border border-nature-100"
                        />
                        <div className="flex justify-between items-center text-[10px] font-black text-nature-400 px-1 mt-2">
                            <span>VACÍO</span>
                            <span>LLENO</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Analysis Summary */}
            <div className="px-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-nature-900 p-6 rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Necesidad Diaria</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black font-outfit">{Math.round(totalNeed)}L</span>
                    </div>
                    {rainForecast > 0 && (
                        <p className="text-[10px] font-bold text-green-400 mt-2 flex items-center gap-2">
                            <CloudRain size={12} /> -{Math.round(rainForecast * 5)}L por lluvia
                        </p>
                    )}
                </div>

                <div className={clsx(
                    "p-6 rounded-[2.5rem] border",
                    daysAvailable > 3 ? "bg-white border-nature-100" : "bg-orange-50 border-orange-100"
                )}>
                    <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Autonomía</p>
                    <div className="flex items-baseline gap-2">
                        <span className={clsx("text-4xl font-black font-outfit", daysAvailable < 3 ? "text-orange-600" : "text-nature-900")}>
                            {daysAvailable === Infinity ? '∞' : daysAvailable}
                        </span>
                        <span className="text-xs font-bold text-earth-300 uppercase">Días restantes</span>
                    </div>
                </div>
            </div>

            {/* Crop Dosages */}
            <div className="px-2 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-nature-900 uppercase tracking-widest">Dosificación por Cultivo</h3>
                    <Beaker size={18} className="text-nature-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crops.map((crop) => {
                        const need = WATER_NEEDS[crop.type]?.[crop.name] || WATER_NEEDS[crop.type]?.default || 1;
                        const total = need * (crop.quantity || 1);

                        return (
                            <motion.div
                                key={crop.id}
                                className="bg-white p-5 rounded-3xl border border-nature-100 flex items-center justify-between group hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Droplets size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-nature-900 text-sm leading-none mb-1">{crop.name}</h4>
                                        <p className="text-[10px] font-bold text-earth-300 uppercase">{crop.quantity || 1} uds • {need}L/día c.u</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-black font-outfit text-blue-600 leading-none">{total.toFixed(1)}L</span>
                                    <span className="text-[8px] font-black text-earth-200 uppercase tracking-widest">Dosis Hoy</span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {crops.length === 0 && (
                        <div className="col-span-full py-10 text-center bg-nature-50 rounded-3xl border border-dashed border-nature-100">
                            <p className="text-[10px] font-black text-earth-300 uppercase tracking-widest">No hay cultivos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Tip */}
            <div className="px-2">
                <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit text-blue-600">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest">Optimización Hidro-IA</h4>
                        <p className="text-xs font-bold text-blue-800 leading-relaxed mt-1">
                            {effectiveNeed < totalNeed
                                ? "La lluvia prevista te permite ahorrar agua hoy. Riega solo lo indispensable en zonas cubiertas."
                                : "No se prevé lluvia. El riego es crítico para mantener la vitalidad de tus cultivos."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterControl;
