import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Trophy, Calendar, Scale, Camera, Star, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const Harvests = () => {
    const [harvests, setHarvests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHarvests = async () => {
            const { data, error } = await supabase
                .from('harvests')
                .select('*')
                .order('harvest_date', { ascending: false });

            if (!error && data) setHarvests(data);
            setLoading(false);
        };
        fetchHarvests();
    }, []);

    const deleteHarvest = async (id) => {
        const { error } = await supabase.from('harvests').delete().eq('id', id);
        if (!error) setHarvests(harvests.filter(h => h.id !== id));
    };

    const totalKg = harvests.reduce((acc, curr) => acc + (parseFloat(curr.quantity_kg) || 0), 0);

    return (
        <div className="space-y-6 pb-24 px-2">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight">Hall of Fame</h2>
                    <p className="text-earth-400 text-sm font-medium">Registro de Éxitos y Cosechas</p>
                </div>
                <div className="p-4 bg-yellow-400 text-white rounded-3xl shadow-xl shadow-yellow-100">
                    <Trophy size={28} strokeWidth={3} />
                </div>
            </div>

            {/* Total Stats Card */}
            <div className="p-8 bg-gradient-to-br from-nature-800 to-black rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl">
                <div>
                    <p className="text-nature-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Producción Total Historica</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black font-outfit tracking-tighter">{totalKg.toFixed(1)}</span>
                        <span className="text-xl font-black text-nature-500 uppercase">Kg</span>
                    </div>
                </div>
                <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                    <Scale size={32} className="text-yellow-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {harvests.map((harvest) => (
                        <motion.div
                            key={harvest.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-nature-100 shadow-sm overflow-hidden group"
                        >
                            {harvest.image && (
                                <div className="h-48 w-full overflow-hidden relative">
                                    <img src={harvest.image} alt={harvest.crop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-black text-nature-900">{harvest.ia_score}%</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-nature-900 font-outfit leading-tight">{harvest.crop_name}</h3>
                                        <p className="text-xs font-bold text-earth-300 uppercase tracking-widest">{harvest.variety}</p>
                                    </div>
                                    <button onClick={() => deleteHarvest(harvest.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-nature-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-nature-100/50">
                                        <div className="flex items-center gap-1.5 text-earth-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest font-outfit">Fecha</span>
                                        </div>
                                        <span className="text-sm font-black text-nature-800">{harvest.harvest_date}</span>
                                    </div>
                                    <div className="bg-nature-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-nature-100/50">
                                        <div className="flex items-center gap-1.5 text-earth-400">
                                            <Scale size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest font-outfit">Peso Recogido</span>
                                        </div>
                                        <span className="text-sm font-black text-nature-800">{harvest.quantity_kg} Kg</span>
                                    </div>
                                </div>

                                {harvest.notes && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-600 italic font-medium">"{harvest.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {harvests.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-nature-100 rounded-[3rem] bg-nature-50/30">
                        <Trophy className="mx-auto text-nature-100 mb-4 opacity-50" size={64} />
                        <h4 className="text-lg font-bold text-nature-900">Aún no hay trofeos</h4>
                        <p className="text-earth-300 text-sm max-w-[200px] mx-auto">Cosecha tus cultivos actuales para verlos brillar aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Harvests;
