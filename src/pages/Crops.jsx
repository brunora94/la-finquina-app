import React, { useState, useEffect } from 'react';
import {
    Plus, X, Save, Sprout, TreeDeciduous, Calendar, Droplets,
    Zap, Activity, Info, Beaker, Scissors, Bug, Wind, Sun,
    Bot, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const CROP_TYPES = [
    { id: 'huerto', label: 'Huerto', icon: <Sprout />, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'frutal', label: 'Frutal', icon: <TreeDeciduous />, color: 'text-orange-600', bg: 'bg-orange-50' }
];

const HEALTH_LEVELS = [
    { id: 'excelente', label: 'Excelente', color: 'bg-green-500' },
    { id: 'normal', label: 'Normal', color: 'bg-blue-500' },
    { id: 'estresado', label: 'Estresado', color: 'bg-yellow-500' },
    { id: 'enfermo', label: 'Enfermo', color: 'bg-red-500' }
];

const IRRIGATION_TYPES = ['Goteo', 'Aspersión', 'Manual', 'Surcos'];

const COMPANIONS = {
    'Tomate': { friends: ['Albahaca', 'Zanahoria', 'Ajo'], enemies: ['Patata', 'Hinojo'] },
    'Lechuga': { friends: ['Zanahoria', 'Rábano', 'Fresa'], enemies: ['Perejil'] },
    'Cebolla': { friends: ['Remolacha', 'Lechuga'], enemies: ['Legumbres'] }
};

const Crops = () => {
    const [activeTab, setActiveTab] = useState('huerto');
    const [crops, setCrops] = useState(() => {
        const saved = localStorage.getItem('finquina_crops_v2');
        return saved ? JSON.parse(saved) : [];
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'huerto',
        name: '',
        variety: '',
        plantedDate: new Date().toISOString().split('T')[0],
        health: 'excelente',
        irrigation: 'Goteo',
        // Specifics for Huerto
        harvestDate: '',
        companion: '',
        // Specifics for Frutal
        lastPruning: '',
        rootstock: '',
        lastTreatment: '',
        notes: ''
    });

    const [analyzingId, setAnalyzingId] = useState(null);

    useEffect(() => {
        localStorage.setItem('finquina_crops_v2', JSON.stringify(crops));
    }, [crops]);

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Resize logic using Canvas
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG for space saving
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                setCrops(prevCrops => prevCrops.map(c =>
                    c.id === id ? { ...c, image: dataUrl, aiAnalysis: null } : c
                ));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const analyzeWithAI = (id) => {
        setAnalyzingId(id);

        // Simulating IA Vision processing
        setTimeout(() => {
            setCrops(prevCrops => prevCrops.map(c => {
                if (c.id === id) {
                    const isFrutal = c.type === 'frutal';
                    const diagnostics = isFrutal
                        ? "Hojas con buen verdor. Se detecta inicio de brotación. Recomendación: Aplicar preventivo de cobre y revisar pulgón en brotes nuevos."
                        : "Crecimiento vigoroso. Se observa ligera clorosis en hojas basales (falta de Nitrógeno). Recomendación: Abonar con humus de lombriz.";

                    return {
                        ...c,
                        aiAnalysis: {
                            status: "Éxito",
                            diagnosis: diagnostics,
                            action: isFrutal ? "Poda de limpieza y abonado" : "Abonado foliar orgánico",
                            timestamp: new Date().toLocaleString()
                        }
                    };
                }
                return c;
            }));
            setAnalyzingId(null);
        }, 2500);
    };

    const handleSave = () => {
        if (!formData.name) return;
        const newCrop = { id: Date.now(), ...formData, image: null, aiAnalysis: null };
        setCrops([newCrop, ...crops]);
        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            type: activeTab,
            name: '',
            variety: '',
            plantedDate: new Date().toISOString().split('T')[0],
            health: 'excelente',
            irrigation: 'Goteo',
            harvestDate: '',
            companion: '',
            lastPruning: '',
            rootstock: '',
            lastTreatment: '',
            notes: ''
        });
    };

    const deleteCrop = (id) => {
        if (window.confirm('¿Eliminar este registro permanentemente?')) {
            setCrops(crops.filter(c => c.id !== id));
        }
    };

    const filteredCrops = crops.filter(c => c.type === activeTab);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight">Mis Cultivos</h2>
                    <p className="text-earth-400 text-sm font-medium">Análisis de salud por IA</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="p-4 bg-nature-600 text-white rounded-3xl shadow-xl shadow-nature-100 active:scale-95 transition-all"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-nature-100/50 rounded-3xl gap-1 mx-2">
                {CROP_TYPES.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all text-sm",
                            activeTab === tab.id
                                ? "bg-white text-nature-900 shadow-sm"
                                : "text-nature-400 hover:text-nature-600"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Crop Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
                <AnimatePresence mode="popLayout">
                    {filteredCrops.map(crop => (
                        <motion.div
                            key={crop.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] border border-nature-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                        >
                            {/* Photo Section */}
                            <div className="h-48 bg-nature-50 relative overflow-hidden group/img">
                                {crop.image ? (
                                    <img src={crop.image} alt={crop.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-nature-200">
                                        {crop.type === 'huerto' ? <Sprout size={48} /> : <TreeDeciduous size={48} />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Sin imagen real</span>
                                    </div>
                                )}

                                {/* Photo Actions */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity gap-2">
                                    <label className="cursor-pointer bg-white text-nature-900 p-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold text-xs hover:bg-nature-50 active:scale-95 transition-all">
                                        <Camera size={18} />
                                        {crop.image ? 'Cambiar Foto' : 'Subir Foto'}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(crop.id, e)} className="hidden" />
                                    </label>
                                    {crop.image && (
                                        <button
                                            onClick={() => analyzeWithAI(crop.id)}
                                            disabled={analyzingId === crop.id}
                                            className="bg-nature-600 text-white p-3 rounded-2xl shadow-lg flex items-center gap-2 font-bold text-xs hover:bg-nature-700 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Bot size={18} className={analyzingId === crop.id ? 'animate-spin' : ''} />
                                            Analizar IA
                                        </button>
                                    )}
                                </div>

                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => deleteCrop(crop.id)} className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-nature-900 font-outfit">{crop.name}</h3>
                                        <p className="text-xs font-bold text-earth-300 uppercase tracking-widest">{crop.variety || 'Variedad estándar'}</p>
                                    </div>
                                    <div className={clsx("px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                        crop.type === 'huerto' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                                        {crop.type}
                                    </div>
                                </div>

                                {/* AI Analysis Content */}
                                {crop.aiAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-3xl"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1 bg-white rounded-lg shadow-sm">
                                                <Bot size={14} className="text-indigo-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Diagnóstico de Élite</span>
                                        </div>
                                        <p className="text-xs text-indigo-900 leading-relaxed font-medium">{crop.aiAnalysis.diagnosis}</p>
                                        <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-indigo-400">{crop.aiAnalysis.timestamp}</span>
                                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">{crop.aiAnalysis.action}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Main Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-nature-50/50 rounded-2xl p-3 flex flex-col gap-1 border border-nature-100/50">
                                        <div className="flex items-center gap-1.5 text-earth-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Iniciado</span>
                                        </div>
                                        <span className="text-sm font-black text-nature-800 tracking-tighter">{crop.plantedDate}</span>
                                    </div>
                                    <div className="bg-nature-50/50 rounded-2xl p-3 flex flex-col gap-1 border border-nature-100/50">
                                        <div className="flex items-center gap-1.5 text-earth-400">
                                            <Activity size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Vitalidad</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-2 h-2 rounded-full", HEALTH_LEVELS.find(h => h.id === crop.health)?.color)} />
                                            <span className="text-sm font-black text-nature-800 capitalize tracking-tighter">{crop.health}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Companion / Pruning Footer */}
                                <div className="flex items-center justify-between text-xs px-2">
                                    <div className="flex items-center gap-2 text-earth-400 font-bold uppercase tracking-tighter text-[10px]">
                                        <Droplets size={14} className="text-blue-400" />
                                        {crop.irrigation}
                                    </div>
                                    {crop.type === 'frutal' && (
                                        <div className="flex items-center gap-2 text-earth-400 font-bold uppercase tracking-tighter text-[10px]">
                                            <Scissors size={14} className="text-orange-400" />
                                            Poda: {crop.lastPruning || 'N/A'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredCrops.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-nature-100 rounded-[3rem]">
                        <div className="bg-nature-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'huerto' ? <Sprout className="text-nature-200" size={40} /> : <TreeDeciduous className="text-nature-200" size={40} />}
                        </div>
                        <h4 className="text-lg font-bold text-nature-900">No hay registros de {activeTab}</h4>
                        <p className="text-earth-300 text-sm">Añade tu primer cultivo pulsando el botón +</p>
                    </div>
                )}
            </div>

            {/* Advanced Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-end p-0 sm:p-4 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-2xl bg-white rounded-t-[3rem] shadow-2xl p-8 max-h-[92vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-nature-900 font-outfit">Ficha de Cultivo</h3>
                                    <p className="text-earth-400 text-sm">Completa todos los detalles para un seguimiento de élite</p>
                                </div>
                                <X onClick={() => setIsFormOpen(false)} className="cursor-pointer text-gray-300" />
                            </div>

                            <div className="space-y-6">
                                {/* Type Selector within Form */}
                                <div className="flex gap-4">
                                    {CROP_TYPES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setFormData({ ...formData, type: t.id })}
                                            className={clsx(
                                                "flex-1 p-4 rounded-3xl border-2 transition-all flex items-center flex-col gap-2",
                                                formData.type === t.id ? "border-nature-600 bg-nature-50" : "border-gray-50 bg-gray-50/30"
                                            )}
                                        >
                                            <span className={formData.type === t.id ? 'text-nature-600' : 'text-gray-400'}>{t.icon}</span>
                                            <span className={clsx("text-xs font-bold uppercase tracking-widest",
                                                formData.type === t.id ? 'text-nature-800' : 'text-gray-400')}>{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Cultivo / Especie</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-f" placeholder="Ej: Manzano, Tomate..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Variedad específica</label>
                                        <input type="text" value={formData.variety} onChange={e => setFormData({ ...formData, variety: e.target.value })} className="input-f" placeholder="Ej: Fuji, Corazón de buey" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Fecha de Siembra/Plantación</label>
                                        <input type="date" value={formData.plantedDate} onChange={e => setFormData({ ...formData, plantedDate: e.target.value })} className="input-f" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Sistema de Riego</label>
                                        <select value={formData.irrigation} onChange={e => setFormData({ ...formData, irrigation: e.target.value })} className="input-f appearance-none">
                                            {IRRIGATION_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {formData.type === 'huerto' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Fecha estimada de cosecha</label>
                                            <input type="date" value={formData.harvestDate} onChange={e => setFormData({ ...formData, harvestDate: e.target.value })} className="input-f" />
                                        </div>
                                        <div className="space-y-1 bg-green-50/50 p-4 rounded-3xl border border-green-100">
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Nota de IA</p>
                                            <p className="text-xs text-nature-600 italic leading-relaxed">Te sugeriremos asociaciones automáticamente al guardar.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Última Poda</label>
                                            <input type="date" value={formData.lastPruning} onChange={e => setFormData({ ...formData, lastPruning: e.target.value })} className="input-f" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Patrón / Rootstock</label>
                                            <input type="text" value={formData.rootstock} onChange={e => setFormData({ ...formData, rootstock: e.target.value })} className="input-f" placeholder="Ej: M9, MM106..." />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Estado de Salud actual</label>
                                    <div className="flex gap-2">
                                        {HEALTH_LEVELS.map(h => (
                                            <button
                                                key={h.id}
                                                onClick={() => setFormData({ ...formData, health: h.id })}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2",
                                                    formData.health === h.id ? `${h.color} text - white border - transparent shadow - lg` : "bg-gray-50 text-gray-400 border-gray-100"
                                                )}
                                            >
                                                {h.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="w-full p-5 bg-nature-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                                >
                                    <Save size={24} /> Registrar en La Finquina
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
    .input - f {
    width: 100 %;
    padding: 1rem 1.25rem;
    background - color: #f7f9f7;
    border: 1px solid #e2e8e2;
    border - radius: 1.25rem;
    font - size: 0.875rem;
    font - weight: 600;
    color: #1a2e1a;
    transition: all 0.2s;
}
                .input - f:focus {
    outline: none;
    background - color: white;
    border - color: #32ad32;
    box - shadow: 0 0 0 4px rgba(50, 173, 50, 0.1);
}
`}</style>
        </div>
    );
};

export default Crops;
