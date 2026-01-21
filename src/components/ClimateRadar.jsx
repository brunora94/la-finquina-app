import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    CloudRain,
    Thermometer,
    ChevronLeft,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    SearchX
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { FARM_CONFIG } from '../constants';
import clsx from 'clsx';

const ClimateRadar = ({ onBack }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgMax: 0,
        avgMin: 0,
        totalRain: 0,
        rainyDays: 0,
        hottestDay: { date: '', temp: 0 }
    });

    const { lat, lon } = FARM_CONFIG.location;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch last 30 days of historical weather
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&past_days=31`
                );

                if (!response.ok) throw new Error('Could not fetch radar data');
                const data = await response.json();

                // Process data for charts (last 30 days history, excluding today/forecast)
                const dates = data.daily.time.slice(0, 31);
                const maxTemps = data.daily.temperature_2m_max.slice(0, 31);
                const minTemps = data.daily.temperature_2m_min.slice(0, 31);
                const rain = data.daily.precipitation_sum.slice(0, 31);

                const formatted = dates.map((date, i) => ({
                    date: date.split('-').slice(1).reverse().join('/'),
                    max: maxTemps[i],
                    min: minTemps[i],
                    rain: rain[i]
                }));

                setHistoryData(formatted);

                // Calculate stats
                const nonNullMax = maxTemps.filter(t => t !== null);
                const nonNullMin = minTemps.filter(t => t !== null);
                const maxVal = Math.max(...nonNullMax);
                const maxIdx = maxTemps.indexOf(maxVal);

                setStats({
                    avgMax: (nonNullMax.reduce((a, b) => a + b, 0) / nonNullMax.length).toFixed(1),
                    avgMin: (nonNullMin.reduce((a, b) => a + b, 0) / nonNullMin.length).toFixed(1),
                    totalRain: rain.reduce((a, b) => a + (b || 0), 0).toFixed(1),
                    rainyDays: rain.filter(r => r > 0.5).length,
                    hottestDay: {
                        date: formatted[maxIdx]?.date || 'N/A',
                        temp: maxVal
                    }
                });

                setLoading(false);
            } catch (error) {
                console.error("Radar Error:", error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, [lat, lon]);

    if (loading) return (
        <div className="min-h-screen bg-earth-50 flex flex-col items-center justify-center p-8 gap-4">
            <div className="w-16 h-16 border-4 border-nature-100 border-t-nature-600 rounded-full animate-spin" />
            <p className="text-nature-400 font-black uppercase tracking-widest text-xs">Sincronizando con satélites...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white rounded-2xl border border-nature-100/50 shadow-sm text-nature-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight leading-none">Radar Climático</h2>
                        <span className="text-[10px] font-black text-earth-300 uppercase tracking-widest">Tendencias 31 días</span>
                    </div>
                </div>
                <div className="p-3 bg-nature-900 text-white rounded-2xl shadow-xl">
                    <TrendingUp size={24} />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-[2rem] border border-nature-100 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Thermometer size={14} className="text-red-500" />
                        <span className="text-[9px] font-black text-earth-400 uppercase tracking-widest leading-none">Media T. Máx</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-nature-900 font-outfit">{stats.avgMax}°</span>
                        <ArrowUpRight size={14} className="text-red-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-[2rem] border border-nature-100 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <CloudRain size={14} className="text-blue-500" />
                        <span className="text-[9px] font-black text-earth-400 uppercase tracking-widest leading-none">Lluvia Total</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-nature-900 font-outfit">{stats.totalRain}</span>
                        <span className="text-xs font-black text-nature-400">mm</span>
                    </div>
                </motion.div>
            </div>

            {/* Temperature History Chart */}
            <div className="mx-2 bg-white p-6 rounded-[2.5rem] border border-nature-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black text-nature-900 uppercase tracking-widest">Histórico de Temperaturas</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[8px] font-bold text-earth-300">MAX</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-earth-300">MIN</span></div>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                            <defs>
                                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                fontSize={8}
                                tickLine={false}
                                axisLine={false}
                                interval={6}
                                tickFormatter={(val) => val.split('/')[0]}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                            />
                            <Area type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorMax)" />
                            <Area type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={3} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Precipitation Bar Chart */}
            <div className="mx-2 bg-white p-6 rounded-[2.5rem] border border-nature-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-nature-900 uppercase tracking-widest px-2">Lluvias Diarias (mm)</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                fontSize={8}
                                tickLine={false}
                                axisLine={false}
                                interval={6}
                                tickFormatter={(val) => val.split('/')[0]}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="rain" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg"><Calendar size={14} className="text-blue-500" /></div>
                        <span className="text-[10px] font-black text-blue-900 uppercase">Días de Lluvia Real</span>
                    </div>
                    <span className="text-xl font-black text-blue-600">{stats.rainyDays} <span className="text-[10px]">días</span></span>
                </div>
            </div>

            {/* Hottest Point Card */}
            <div className="mx-2 bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-red-100">
                <div className="relative z-10">
                    <p className="text-orange-100 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Pico de Calor Máximo</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-4xl font-black font-outfit leading-none mb-1">{stats.hottestDay.temp}°</p>
                            <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">{stats.hottestDay.date}</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                            <TrendingUp size={32} />
                        </div>
                    </div>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                    <Thermometer size={140} />
                </div>
            </div>
        </div>
    );
};

export default ClimateRadar;
