import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Plus,
    Share2,
    QrCode,
    Tag,
    MapPin,
    Trash2,
    X,
    Camera,
    Check,
    ChevronLeft,
    Box,
    Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const Marketplace = ({ onBack }) => {
    const [items, setItems] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: '',
        price: 'Gratis',
        description: '',
        category: 'Hortalizas'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const { data, error } = await supabase.from('marketplace').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setItems(data);
        } else if (error && error.code === '42P01') {
            // Table doesn't exist, use demo data
            setItems([
                { id: 1, name: 'Tomates Raf', quantity: '5kg', price: 'Regalo', description: 'Muy dulces, me sobran muchos.', category: 'Hortalizas', created_at: new Date().toISOString() },
                { id: 2, name: 'Huevos Camperos', quantity: '2 docenas', price: '3€', description: 'De mis gallinas felices.', category: 'Granja', created_at: new Date().toISOString() }
            ]);
        }
        setLoading(false);
    };

    const handleAddItem = async () => {
        if (!newItem.name) return;
        const item = { ...newItem, created_at: new Date().toISOString() };

        // Optimistic UI
        setItems([item, ...items]);
        setIsFormOpen(false);
        setNewItem({ name: '', quantity: '', price: 'Gratis', description: '', category: 'Hortalizas' });

        // Try storage
        await supabase.from('marketplace').insert([item]);
    };

    const deleteItem = async (id) => {
        setItems(items.filter(i => i.id !== id));
        await supabase.from('marketplace').delete().eq('id', id);
    };

    const shareOnWhatsApp = (item) => {
        const text = `¡Hola! Tengo excedentes en La Finquina: ${item.name} (${item.quantity}). Precio: ${item.price}. ¿Te interesa?`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white rounded-2xl border border-nature-100 shadow-sm text-nature-600 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight leading-none">Excedentes</h2>
                        <span className="text-[10px] font-black text-earth-300 uppercase tracking-widest">Tablón Comunitario</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-4 bg-nature-900 text-white rounded-[1.5rem] shadow-xl active:scale-90 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 px-2">
                <div className="bg-nature-900 p-6 rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Mis Anuncios</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black font-outfit">{items.length}</span>
                        <span className="text-xs font-bold opacity-60 uppercase">Activos</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-nature-100 shadow-sm">
                    <p className="text-[10px] font-black text-earth-300 uppercase tracking-widest mb-2">Impacto Social</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text- प्रकृति-900 font-outfit">0</span>
                        <span className="text-xs font-bold text-nature-400 uppercase">Canjes</span>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="px-2 space-y-4">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-[2.5rem] border border-nature-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex gap-5">
                            <div className="w-20 h-20 bg-nature-50 rounded-3xl flex items-center justify-center shrink-0 border border-nature-100 group-hover:bg-nature-900 group-hover:text-white transition-all overflow-hidden">
                                <Box size={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-black text-nature-900 text-lg leading-none truncate">{item.name}</h3>
                                    <span className="bg-nature-100 text-nature-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">{item.category}</span>
                                </div>
                                <p className="text-xs font-bold text-earth-400 mb-3">{item.quantity} • <span className="text-nature-600 font-black">{item.price}</span></p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => shareOnWhatsApp(item)}
                                        className="flex-1 h-10 bg-nature-50 rounded-xl flex items-center justify-center gap-2 text-nature-900 hover:bg-nature-900 hover:text-white transition-all text-xs font-black uppercase"
                                    >
                                        <Share2 size={14} /> WhatsApp
                                    </button>
                                    <button
                                        onClick={() => setSelectedItem(item)}
                                        className="w-10 h-10 bg-nature-50 rounded-xl flex items-center justify-center text-nature-900 hover:bg-nature-900 hover:text-white transition-all"
                                    >
                                        <QrCode size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {items.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-nature-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-nature-100 opacity-40">
                            <ShoppingBag size={40} className="text-nature-200" />
                        </div>
                        <p className="text-earth-300 font-black uppercase tracking-widest text-xs">No hay excedentes publicados</p>
                    </div>
                )}
            </div>

            {/* Modal de Nuevo Ítem */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[3rem] p-8 shadow-2xl">
                            <div className="w-12 h-1.5 bg-nature-100 rounded-full mx-auto mb-8" />
                            <h3 className="text-2xl font-black text-nature-900 font-outfit mb-6">Publicar Excedente</h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-earth-300 uppercase tracking-widest pl-1">¿Qué te sobra?</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 font-bold focus:outline-none focus:ring-2 focus:ring-nature-900"
                                        placeholder="Ej: Tomates Cherry"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-earth-300 uppercase tracking-widest pl-1">Cantidad</label>
                                        <input
                                            type="text"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                            className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 font-bold focus:outline-none focus:ring-2 focus:ring-nature-900"
                                            placeholder="Ej: 2 kg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-earth-300 uppercase tracking-widest pl-1">Precio / Tipo</label>
                                        <input
                                            type="text"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 font-bold focus:outline-none focus:ring-2 focus:ring-nature-900"
                                            placeholder="Ej: 2€ o Gratis"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    className="w-full h-16 bg-nature-900 text-white rounded-3xl font-black text-lg shadow-xl shadow-nature-100 active:scale-95 transition-all mt-4"
                                >
                                    Abrir Anuncio
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal QR */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-nature-900/40 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 text-center shadow-2xl overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-40 bg-nature-900 -z-10" />
                            <div className="w-20 h-20 bg-white rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center shadow-xl border-4 border-nature-900">
                                <Sparkles size={32} className="text-nature-900" />
                            </div>
                            <h3 className="text-xl font-black text-nature-900 font-outfit mb-2">{selectedItem.name}</h3>
                            <p className="text-xs text-earth-400 font-bold uppercase tracking-widest mb-8">Escanea para Ver en La Finquina</p>

                            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-nature-50 shadow-inner inline-block mb-8">
                                <QRCodeSVG value={`https://la-finquina-app.vercel.app/market/${selectedItem.id}`} size={180} />
                            </div>

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-full py-4 text-nature-400 font-black uppercase tracking-widest text-[10px]"
                            >
                                Cerrar Escaparate
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Marketplace;
