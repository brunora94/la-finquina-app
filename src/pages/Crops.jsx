import React, { useState, useEffect } from 'react';
import {
    Plus, X, Save, Sprout, TreeDeciduous, Calendar, Droplets,
    Zap, Activity, Info, Beaker, Scissors, Bug, Wind, Sun,
    Bot, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { analyzeCropPhoto, analyzeGardenLayout, identifySpecies } from '../lib/gemini';
import { LayoutGrid, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        const fetchCrops = async () => {
            const { data, error } = await supabase
                .from('crops')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) {
                if (data && data.length > 0) {
                    setCrops(data);
                } else {
                    // MIGRATION
                    const saved = localStorage.getItem('finquina_crops_v2');
                    if (saved) {
                        const localData = JSON.parse(saved);
                        if (localData.length > 0) {
                            console.log('Migrando cultivos a la nube...');
                            // CLEAN DATA: convert emptystrings to nulls for dates
                            const toUpload = localData.map(({ id, ...rest }) => {
                                const clean = { ...rest };
                                if (!clean.plantedDate) clean.plantedDate = null;
                                if (!clean.harvestDate) clean.harvestDate = null;
                                if (!clean.lastPruning) clean.lastPruning = null;
                                if (!clean.lastTreatment) clean.lastTreatment = null;
                                return clean;
                            });

                            const { data: uploaded } = await supabase
                                .from('crops')
                                .insert(toUpload)
                                .select();
                            if (uploaded) setCrops(uploaded);
                        }
                    }
                }
            } else {
                const saved = localStorage.getItem('finquina_crops_v2');
                if (saved) setCrops(JSON.parse(saved));
            }
            setLoading(false);
        };
        fetchCrops();
    }, []);

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
        notes: '',
        row_number: 1,
        quantity: 1
    });

    const [analyzingId, setAnalyzingId] = useState(null);
    const [analyzingLayout, setAnalyzingLayout] = useState(false);
    const [layoutAnalysis, setLayoutAnalysis] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem('finquina_crops_v2', JSON.stringify(crops));
        } catch (e) {
            console.error("Error saving to localStorage", e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("¡Atención! La memoria del navegador está llena por las fotos. Borra algún cultivo antiguo para seguir guardando.");
            }
        }
    }, [crops]);

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (!file) return;


        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
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

                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);

                // Optimistic UI update
                setCrops(prevCrops => prevCrops.map(c =>
                    c.id === id ? { ...c, image: dataUrl, aiAnalysis: null } : c
                ));

                // Sync to Supabase - only if we have a real DB id
                if (typeof id === 'number' && id < 1000000000000) {
                    await supabase
                        .from('crops')
                        .update({ image: dataUrl, aiAnalysis: null })
                        .eq('id', id);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const [identifying, setIdentifying] = useState(false);

    const handleIdentify = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            setIdentifying(true);
            try {
                const result = await identifySpecies(base64);
                if (result) {
                    setFormData(prev => ({
                        ...prev,
                        name: result.name || prev.name,
                        variety: result.variety || prev.variety,
                    }));
                }
            } catch (error) {
                console.error("Identificación fallida:", error);
            } finally {
                setIdentifying(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const [qrValue, setQrValue] = useState(null);
    const [harvestingCrop, setHarvestingCrop] = useState(null);
    const [harvestData, setHarvestData] = useState({ quantity_kg: '', notes: '', image: null });

    const handleHarvestSubmit = async () => {
        if (!harvestingCrop || !harvestData.quantity_kg) return;

        const finalHarvest = {
            crop_name: harvestingCrop.name,
            variety: harvestingCrop.variety,
            quantity_kg: parseFloat(harvestData.quantity_kg),
            harvest_date: new Date().toISOString().split('T')[0],
            image: harvestData.image || harvestingCrop.image,
            ia_score: harvestingCrop.aiAnalysis ? 95 : 80, // Simplificación puntuación
            notes: harvestData.notes
        };

        const { error } = await supabase.from('harvests').insert([finalHarvest]);
        if (!error) {
            await supabase.from('crops').delete().eq('id', harvestingCrop.id);
            setCrops(crops.filter(c => c.id !== harvestingCrop.id));
            setHarvestingCrop(null);
            setHarvestData({ quantity_kg: '', notes: '', image: null });
        }
    };

    const analyzeWithAI = async (id) => {
        const crop = crops.find(c => c.id === id);
        if (!crop || !crop.image) {
            alert("Por favor, sube una foto antes de analizar.");
            return;
        }

        setAnalyzingId(id);

        try {
            // Real AI Analysis with Gemini
            const analysis = await analyzeCropPhoto(crop.image, crop);

            let updatedCrop = null;

            setCrops(prevCrops => prevCrops.map(c => {
                if (c.id === id) {
                    updatedCrop = {
                        ...c,
                        harvestDate: analysis.estimatedHarvestDate,
                        aiAnalysis: {
                            status: analysis.status,
                            diagnosis: analysis.diagnosis,
                            action: analysis.action,
                            timestamp: new Date().toLocaleString(),
                            estimatedHarvest: analysis.estimatedHarvestDate,
                            isSimulation: analysis.isSimulation
                        }
                    };
                    return updatedCrop;
                }
                return c;
            }));

            // Sync to Supabase
            if (updatedCrop && typeof id === 'number' && id < 1000000000000) {
                await supabase
                    .from('crops')
                    .update({
                        harvestDate: updatedCrop.harvestDate || null,
                        aiAnalysis: updatedCrop.aiAnalysis
                    })
                    .eq('id', id);
            }
        } catch (error) {
            console.error("Error en análisis IA:", error);
            if (error.message === 'API_KEY_MISSING') {
                alert("⚠️ ¡Falta tu API Key! Ve a Vercel, añade 'VITE_GEMINI_API_KEY' en Environment Variables y haz un 'Redeploy' (Deployments -> Redploy).");
            } else {
                alert("❌ Problema con Google Gemini: " + (error.message || "Error desconocido") + ". Prueba a recargar la página.");
            }
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;

        // Limpiar datos: Convertir strings vacíos en fechas a null para Supabase
        const cleanData = { ...formData };
        if (!cleanData.plantedDate) cleanData.plantedDate = null;
        if (!cleanData.harvestDate) cleanData.harvestDate = null;
        if (!cleanData.lastPruning) cleanData.lastPruning = null;
        if (!cleanData.lastTreatment) cleanData.lastTreatment = null;

        const newCropData = {
            ...cleanData,
            image: null,
            aiAnalysis: null,
            created_at: new Date().toISOString()
        };

        const tempId = Date.now();
        setCrops([{ id: tempId, ...newCropData }, ...crops]);
        setIsFormOpen(false);
        resetForm();

        const { data, error } = await supabase
            .from('crops')
            .insert([newCropData])
            .select();

        if (error) {
            console.error("Error al guardar cultivo en Supabase:", error);
        }

        if (!error && data) {
            setCrops(prev => prev.map(c => c.id === tempId ? data[0] : c));
        }
    };

    const handleUpdate = async () => {
        if (!formData.name || !editingId) return;

        const cleanData = { ...formData };
        if (!cleanData.plantedDate) cleanData.plantedDate = null;
        if (!cleanData.harvestDate) cleanData.harvestDate = null;
        if (!cleanData.lastPruning) cleanData.lastPruning = null;
        if (!cleanData.lastTreatment) cleanData.lastTreatment = null;

        // Propagate changes to local state optimistically
        setCrops(prev => prev.map(c => c.id === editingId ? { ...c, ...cleanData } : c));
        setIsFormOpen(false);
        const idToUpdate = editingId;
        setEditingId(null);
        resetForm();

        const { error } = await supabase
            .from('crops')
            .update(cleanData)
            .eq('id', idToUpdate);

        if (error) {
            console.error("Error al actualizar cultivo en Supabase:", error);
            alert("Error al actualizar: " + error.message);
        }
    };

    const openEditModal = (crop) => {
        setEditingId(crop.id);
        setFormData({
            type: crop.type,
            name: crop.name || '',
            variety: crop.variety || '',
            plantedDate: crop.plantedDate || '',
            health: crop.health || 'excelente',
            irrigation: crop.irrigation || 'Goteo',
            harvestDate: crop.harvestDate || '',
            companion: crop.companion || '',
            lastPruning: crop.lastPruning || '',
            rootstock: crop.rootstock || '',
            lastTreatment: crop.lastTreatment || '',
            notes: crop.notes || '',
            row_number: crop.row_number || 1,
            quantity: crop.quantity || 1
        });
        setIsFormOpen(true);
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
            notes: '',
            row_number: 1,
            quantity: 1
        });
    };

    const handleLayoutAnalysis = async () => {
        if (crops.length === 0) return;
        setAnalyzingLayout(true);
        try {
            const analysis = await analyzeGardenLayout(crops);
            setLayoutAnalysis(analysis);
        } catch (error) {
            alert("Error al analizar el huerto: " + error.message);
        } finally {
            setAnalyzingLayout(false);
        }
    };

    const deleteCrop = async (id) => {
        if (window.confirm('¿Eliminar este registro permanentemente?')) {
            setCrops(crops.filter(c => c.id !== id));
            await supabase.from('crops').delete().eq('id', id);
        }
    };

    const filteredCrops = crops.filter(c => c.type === activeTab);

    // Agrupar por fila para el render
    const groupedCrops = filteredCrops.reduce((acc, crop) => {
        const row = crop.row_number || 1;
        if (!acc[row]) acc[row] = [];
        acc[row].push(crop);
        return acc;
    }, {});

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

            {/* Tabs & View Toggle */}
            <div className="flex flex-col gap-4 mx-2">
                <div className="flex p-1.5 bg-nature-100/50 rounded-3xl gap-1">
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

                <div className="flex p-1 bg-white border border-nature-100 rounded-2xl self-center">
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'list' ? "bg-nature-900 text-white" : "text-nature-300")}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'grid' ? "bg-nature-900 text-white" : "text-nature-300")}
                    >
                        Mapa
                    </button>
                </div>
            </div>

            {/* Garden Layout Analysis Button */}
            {activeTab === 'huerto' && (
                <div className="px-2">
                    <button
                        onClick={handleLayoutAnalysis}
                        disabled={analyzingLayout || filteredCrops.length === 0}
                        className="w-full p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[2rem] shadow-xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {analyzingLayout ? (
                            <Zap className="animate-spin" />
                        ) : (
                            <LayoutGrid />
                        )}
                        <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-widest leading-none">Análisis de Distribución</p>
                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-tight mt-1">IA analiza la armonía de tus filas</p>
                        </div>
                    </button>

                    {/* Layout Analysis Result */}
                    <AnimatePresence>
                        {layoutAnalysis && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mt-4 p-6 bg-white border-2 border-indigo-100 rounded-[2.5rem] shadow-inner overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-xl">
                                            <Bot className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs leading-none">Informe de Armonía Vegetal</h4>
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Cerebro IA v6.0</span>
                                        </div>
                                    </div>
                                    <X size={18} className="text-indigo-200 cursor-pointer" onClick={() => setLayoutAnalysis(null)} />
                                </div>

                                <div className="space-y-4">
                                    {layoutAnalysis.friendships?.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1">Grandes Alianzas 🤝</p>
                                            <div className="flex flex-wrap gap-2">
                                                {layoutAnalysis.friendships.map((f, i) => (
                                                    <span key={i} className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {layoutAnalysis.warnings?.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Conflictos en Filas ⚠️</p>
                                            <div className="flex flex-wrap gap-2">
                                                {layoutAnalysis.warnings.map((w, i) => (
                                                    <span key={i} className="text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100">{w}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {layoutAnalysis.tips?.length > 0 && (
                                        <div className="pt-4 border-t border-indigo-50">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 mb-2">Consejos del Especialista 💡</p>
                                            <ul className="space-y-2">
                                                {layoutAnalysis.tips.map((t, i) => (
                                                    <li key={i} className="text-xs text-indigo-900 font-medium flex gap-2">
                                                        <span className="text-indigo-300">•</span> {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Crop Content */}
            <div className="space-y-10 px-2">
                {viewMode === 'list' ? (
                    Object.entries(groupedCrops).map(([row, cropsInRow]) => (
                        <div key={row} className="space-y-4">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-8 h-8 rounded-xl bg-nature-100 flex items-center justify-center text-nature-600 shadow-sm border border-nature-200/50">
                                    <LayoutGrid size={16} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-outfit font-black text-xl text-nature-900 tracking-tight italic">
                                    Fila <span className="text-nature-500 font-black">{row}</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <AnimatePresence mode="popLayout">
                                    {cropsInRow.map(crop => (
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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setQrValue(`${window.location.origin}?crop=${crop.id}`)}
                                                            className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-nature-600 hover:bg-nature-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Generar QR"
                                                        >
                                                            <QrCode size={16} />
                                                        </button>
                                                        <button onClick={() => openEditModal(crop)} className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-indigo-500 hover:bg-indigo-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Activity size={16} />
                                                        </button>
                                                        <button onClick={() => deleteCrop(crop.id)} className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
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
                                                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center justify-between grow">
                                                                <span>Diagnóstico de Élite</span>
                                                                <span className="text-[7px] text-indigo-400">
                                                                    {crop.aiAnalysis.isSimulation ? 'MODO OFFLINE' : 'v6.0'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-indigo-900 leading-relaxed font-medium">{crop.aiAnalysis.diagnosis}</p>
                                                        <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between items-center">
                                                            <span className="text-[9px] font-bold text-indigo-400">{crop.aiAnalysis.timestamp}</span>
                                                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">{crop.aiAnalysis.action}</span>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Main Stats */}
                                                <div className="grid grid-cols-2 gap-3 mb-3">
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
                                                    <div className="bg-nature-50/50 rounded-2xl p-3 flex flex-col gap-1 border border-nature-100/50">
                                                        <div className="flex items-center gap-1.5 text-earth-400">
                                                            <LayoutGrid size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Cantidad</span>
                                                        </div>
                                                        <span className="text-sm font-black text-nature-800 tracking-tighter">{crop.quantity || 1} {crop.quantity === 1 ? 'planta' : 'plantas'}</span>
                                                    </div>
                                                </div>

                                                {crop.harvestDate && (
                                                    <div className="bg-green-600 text-white rounded-2xl p-4 mb-4 shadow-lg shadow-green-100 flex items-center justify-between group/harvest">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/20 rounded-xl">
                                                                <Sprout size={20} className="text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Cosecha Estimada</p>
                                                                <p className="text-lg font-black font-outfit leading-none mt-0.5">{crop.harvestDate}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setHarvestingCrop(crop)}
                                                            className="text-[10px] font-black bg-white text-green-700 px-3 py-2 rounded-xl uppercase hover:bg-green-50 transition-colors shadow-sm"
                                                        >
                                                            Recoger
                                                        </button>
                                                    </div>
                                                )}

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
                            </div>
                        </div>
                    ))
                ) : (
                    /* GRID MAPPER VIEW */
                    <div className="bg-white rounded-[3rem] p-8 border border-nature-100 shadow-inner overflow-hidden relative">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h4 className="font-black text-nature-900 font-outfit uppercase tracking-tight text-lg">Mapa de Producción</h4>
                                <p className="text-[10px] font-bold text-earth-300 uppercase tracking-widest">Escaneando vitalidad de las filas...</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[8px] font-bold text-earth-300 uppercase">Sano</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[8px] font-bold text-earth-300 uppercase">Crítico</span></div>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {Object.entries(groupedCrops).sort(([a], [b]) => a - b).map(([row, items]) => (
                                <div key={row} className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-nature-50 rounded-2xl flex items-center justify-center border border-nature-100 shrink-0">
                                        <span className="font-black text-nature-900 text-lg font-outfit italic">F{row}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 grow">
                                        {items.map(item => (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                onClick={() => openEditModal(item)}
                                                className={clsx(
                                                    "w-20 h-20 rounded-3xl border-4 relative group/node overflow-hidden transition-all duration-300 shadow-sm",
                                                    item.health === 'excelente' ? "bg-green-50 border-green-200" :
                                                        item.health === 'enfermo' ? "bg-red-50 border-red-200" :
                                                            "bg-blue-50 border-blue-200"
                                                )}
                                            >
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                                    <div className={clsx("w-3 h-3 rounded-full mb-1 animate-pulse",
                                                        item.health === 'excelente' ? "bg-green-500" :
                                                            item.health === 'enfermo' ? "bg-red-500" : "bg-blue-500")}
                                                    />
                                                    <span className="text-[8px] font-black text-nature-900 uppercase leading-none text-center truncate w-full">
                                                        {item.name.split(' ')[0]}
                                                    </span>
                                                </div>
                                                {/* Mini Tooltip overlay on hover */}
                                                <div className="absolute inset-0 bg-nature-900/90 flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-opacity p-1">
                                                    <p className="text-[7px] font-bold text-white text-center uppercase tracking-tighter">
                                                        {item.quantity} p.<br />{item.variety || 'N/A'}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Background Map Grid Decoration */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        />
                    </div>
                )}

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
                                    <div className="space-y-1 relative">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Cultivo / Especie</label>
                                        <div className="relative">
                                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-f pr-12" placeholder="Ej: Manzano, Tomate..." />
                                            <label className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 active:scale-95 transition-all transition-colors">
                                                {identifying ? <Bot size={16} className="animate-spin" /> : <Camera size={16} />}
                                                <input type="file" accept="image/*" onChange={handleIdentify} className="hidden" />
                                            </label>
                                        </div>
                                        {identifying && <p className="text-[8px] text-indigo-500 font-bold absolute -bottom-3 left-1 animate-pulse">Consultando Cerebro IA...</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Variedad específica</label>
                                        <input type="text" value={formData.variety} onChange={e => setFormData({ ...formData, variety: e.target.value })} className="input-f" placeholder="Ej: Fuji, Corazón de buey" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Fila del Huerto / Parcela</label>
                                        <input type="number" min="1" value={formData.row_number} onChange={e => setFormData({ ...formData, row_number: parseInt(e.target.value) || 1 })} className="input-f" placeholder="Número de fila" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Cantidad (Nº Plantas)</label>
                                        <input type="number" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="input-f" placeholder="Ej: 12" />
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
                                                    formData.health === h.id ? `${h.color} text-white border-transparent shadow-lg` : "bg-gray-50 text-gray-400 border-gray-100"
                                                )}
                                            >
                                                {h.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={editingId ? handleUpdate : handleSave}
                                    className="w-full p-5 bg-nature-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                                >
                                    <Save size={24} /> {editingId ? 'Guardar Cambios' : 'Registrar en La Finquina'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {qrValue && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQrValue(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-2xl max-w-xs w-full text-center">
                            <div className="p-6 bg-nature-50 rounded-[2.5rem] border-4 border-nature-100 shadow-inner">
                                <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-nature-900 font-outfit">Etiqueta de Campo</h3>
                                <p className="text-earth-400 text-xs font-medium mt-2">Imprime este código y colócalo en tu cultivo para acceso rápido.</p>
                            </div>
                            <button onClick={() => window.print()} className="w-full p-4 bg-nature-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Imprimir</button>
                            <button onClick={() => setQrValue(null)} className="text-nature-400 font-bold text-xs">Cerrar</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Harvest Confirmation Modal */}
            <AnimatePresence>
                {harvestingCrop && (
                    <div className="fixed inset-0 z-[150] flex items-end justify-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHarvestingCrop(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white rounded-t-[3rem] p-8 w-full max-w-lg shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Trophy size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-nature-900 font-outfit">¡Enhorabuena! 🏆</h3>
                                <p className="text-earth-400 text-sm">Vas a registrar la cosecha de <strong>{harvestingCrop.name}</strong></p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Kilos Recolectados (aprox)</label>
                                    <input
                                        type="number"
                                        value={harvestData.quantity_kg}
                                        onChange={e => setHarvestData({ ...harvestData, quantity_kg: e.target.value })}
                                        className="w-full p-5 bg-nature-50 rounded-2xl border-2 border-nature-100 text-3xl font-black text-center focus:border-yellow-400 outline-none transition-all"
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Notas del Éxito</label>
                                    <textarea
                                        value={harvestData.notes}
                                        onChange={e => setHarvestData({ ...harvestData, notes: e.target.value })}
                                        className="w-full p-5 bg-nature-50 rounded-2xl border-2 border-nature-100 text-sm font-bold min-h-[100px] outline-none"
                                        placeholder="¿Cómo han salido? ¿Sabor, tamaño?..."
                                    />
                                </div>
                                <button onClick={handleHarvestSubmit} className="w-full p-5 bg-nature-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-nature-100">
                                    Finalizar y Guardar en Hall of Fame
                                </button>
                                <button onClick={() => setHarvestingCrop(null)} className="w-full text-center text-earth-300 font-black text-xs uppercase tracking-widest">Cancelar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .fixed.inset-0.z-\\[200\\], .fixed.inset-0.z-\\[200\\] * { visibility: visible; }
                    .fixed.inset-0.z-\\[200\\] { position: absolute; left: 0; top: 0; }
                }
                .input-f {
    width: 100%;
    padding: 1rem 1.25rem;
    background-color: #f7f9f7;
    border: 1px solid #e2e8e2;
    border-radius: 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a2e1a;
    transition: all 0.2s;
}
                .input-f:focus {
    outline: none;
    background-color: white;
    border-color: #32ad32;
    box-shadow: 0 0 0 4px rgba(50, 173, 50, 0.1);
}
`}</style>
        </div>
    );
};

export default Crops;
