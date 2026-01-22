import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Settings, Plus, X, Save, Clock, Calendar, Tool, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const Machinery = () => {
    const [machinery, setMachinery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        type: 'Herramienta',
        last_maintenance: new Date().toISOString().split('T')[0],
        next_maintenance: '',
        hours_of_use: 0,
        status: 'Operativo'
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.from('machinery').select('*').order('name');
            if (data) setMachinery(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!newItem.name) return;
        const { data, error } = await supabase.from('machinery').insert([newItem]).select();
        if (!error && data) setMachinery([...machinery, data[0]]);
        setIsFormOpen(false);
        setNewItem({ name: '', type: 'Herramienta', last_maintenance: new Date().toISOString().split('T')[0], next_maintenance: '', hours_of_use: 0, status: 'Operativo' });
    };

    const removeMachine = async (id) => {
        const { error } = await supabase.from('machinery').delete().eq('id', id);
        if (!error) setMachinery(machinery.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight">Taller</h2>
                    <p className="text-earth-400 text-sm font-medium">Mantenimiento y Maquinaria</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-4 bg-nature-900 text-white rounded-3xl shadow-xl active:scale-95 transition-all"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-2">
                {machinery.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-nature-100 p-6 shadow-sm group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-nature-50 flex items-center justify-center text-nature-900 border border-nature-100 shadow-sm">
                                    <Settings size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-nature-900 font-outfit">{item.name}</h3>
                                    <span className="text-[10px] font-black text-earth-300 uppercase tracking-widest">{item.type}</span>
                                </div>
                            </div>
                            <div className={clsx(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                item.status === 'Operativo' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {item.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-nature-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-nature-100/30">
                                <div className="flex items-center gap-2 text-earth-400">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Uso Acumulado</span>
                                </div>
                                <span className="text-sm font-black text-nature-900">{item.hours_of_use} horas</span>
                            </div>
                            <div className="bg-nature-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-nature-100/30">
                                <div className="flex items-center gap-2 text-earth-400">
                                    <Calendar size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Próxima Revisión</span>
                                </div>
                                <span className="text-sm font-black text-nature-900">{item.next_maintenance || 'Pendiente'}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center pt-4 border-t border-nature-50">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span className="text-[10px] font-bold text-earth-400 uppercase">Última revisión: {item.last_maintenance}</span>
                            </div>
                            <button onClick={() => removeMachine(item.id)} className="p-2 text-gray-200 hover:text-red-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {machinery.length === 0 && !loading && (
                    <div className="py-24 text-center border-2 border-dashed border-nature-100 rounded-[3rem] bg-nature-50/30">
                        <Settings className="mx-auto text-nature-100 mb-4 opacity-50 animate-spin-slow" size={64} />
                        <h4 className="text-lg font-bold text-nature-900">Taller Vacío</h4>
                        <p className="text-earth-300 text-sm max-w-[200px] mx-auto">Registra tus tractores y herramientas para no olvidar su mantenimiento.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[3rem] p-8 shadow-2xl">
                            <h3 className="text-2xl font-black text-nature-900 font-outfit uppercase tracking-tight mb-8">Nueva Maquinaria</h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Nombre / Modelo</label>
                                    <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-elite" placeholder="Ej: Tractor John Deere, Motobomba 5HP" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Tipo</label>
                                        <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="input-elite">
                                            <option value="Maquinaria">Maquinaria</option>
                                            <option value="Herramienta">Herramienta</option>
                                            <option value="Vehículo">Vehículo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Horas Uso</label>
                                        <input type="number" value={newItem.hours_of_use} onChange={e => setNewItem({ ...newItem, hours_of_use: e.target.value })} className="input-elite" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Última Revisión</label>
                                        <input type="date" value={newItem.last_maintenance} onChange={e => setNewItem({ ...newItem, last_maintenance: e.target.value })} className="input-elite" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Próxima Revisión</label>
                                        <input type="date" value={newItem.next_maintenance} onChange={e => setNewItem({ ...newItem, next_maintenance: e.target.value })} className="input-elite" />
                                    </div>
                                </div>
                                <button onClick={handleSave} className="btn-elite-black mt-4">
                                    <Save size={20} /> Registrar en Taller
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .input-elite {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background-color: #f8faf9;
                    border: 2px solid #f1f5f3;
                    border-radius: 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: #1a2e1a;
                    transition: all 0.2s;
                }
                .btn-elite-black {
                    width: 100%;
                    padding: 1.25rem;
                    background-color: #1a2e1a;
                    color: white;
                    border-radius: 1.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                }
            `}</style>
        </div>
    );
};

export default Machinery;
