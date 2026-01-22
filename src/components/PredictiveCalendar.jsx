import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Star, Moon, Cloud, ChevronRight, Sprout, Scissors, Droplets } from 'lucide-react';
import clsx from 'clsx';

const PredictiveCalendar = ({ onNavigate }) => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        // Intelligence logic to define "Golden Days"
        // In a real app, this would fetch from an API or complex logic
        const generateGoldenDays = () => {
            const today = new Date();
            const days = [
                {
                    date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
                    action: 'Siembra de Raíz',
                    crop: 'Zanahoria / Rábano',
                    icon: <Sprout className="text-orange-500" />,
                    reason: 'Luna Menguante + Suelo húmedo.',
                    quality: 'Excelente'
                },
                {
                    date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
                    action: 'Poda de Frutales',
                    crop: 'Manzanos / Perales',
                    icon: <Scissors className="text-red-500" />,
                    reason: 'Ventana sin heladas prevista.',
                    quality: 'Buena'
                },
                {
                    date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                    action: 'Abonado Foliar',
                    crop: 'Todo el huerto',
                    icon: <Droplets className="text-blue-500" />,
                    reason: 'Día nublado, evita quemaduras.',
                    quality: 'Perfecta'
                }
            ];
            setRecommendations(days);
        };
        generateGoldenDays();
    }, []);

    return (
        <div className="card-premium h-full overflow-hidden !p-0 border-nature-100/50">
            <div className="p-5 flex justify-between items-center bg-nature-50/50">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-nature-600" />
                    <h3 className="font-black text-nature-900 font-outfit">Predictor de Éxito</h3>
                </div>
                <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'calendar' }))} className="p-2 text-nature-400 hover:text-nature-600 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                <p className="text-[10px] font-black text-earth-300 uppercase tracking-widest px-1">Próximos Momentos de Oro</p>

                {recommendations.map((rec, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 p-3 rounded-2xl bg-white border border-nature-50 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-nature-50 flex flex-col items-center justify-center shrink-0 border border-nature-100 group-hover:bg-nature-900 group-hover:text-white transition-all">
                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{rec.date.toLocaleDateString('es', { month: 'short' })}</span>
                            <span className="text-lg font-black leading-none">{rec.date.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="font-black text-nature-900 text-xs truncate">{rec.action}</h4>
                                <div className="flex items-center gap-1">
                                    <Star size={8} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-[8px] font-black text-earth-300 uppercase">{rec.quality}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-earth-400 font-medium truncate mb-1">{rec.crop}</p>
                            <div className="flex items-center gap-1.5 p-1.5 bg-nature-50/50 rounded-lg">
                                {rec.icon}
                                <span className="text-[8px] font-bold text-nature-800 leading-tight italic">"{rec.reason}"</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 bg-nature-900 text-white flex items-center justify-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cálculo Lunar & Clima Activo</span>
            </div>
        </div>
    );
};

export default PredictiveCalendar;
