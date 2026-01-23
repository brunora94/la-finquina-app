import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug,
    Camera,
    Upload,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    ChevronLeft,
    Zap,
    Leaf,
    ShieldCheck,
    Info
} from 'lucide-react';
import { diagnosePest } from '../lib/gemini';
import clsx from 'clsx';

const PestRadar = ({ onBack }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const runDiagnosis = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const diagnosis = await diagnosePest(image);
            setResult(diagnosis);
        } catch (error) {
            console.error("Diagnosis failed", error);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
    };

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
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight leading-none">Radar de Plagas</h2>
                    <span className="text-[10px] font-black text-earth-300 uppercase tracking-widest">Escáner Bio-Guardian</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="px-2 space-y-6"
                    >
                        {/* Upload Area */}
                        <div
                            onClick={() => !loading && fileInputRef.current.click()}
                            className={clsx(
                                "relative aspect-square rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer group",
                                image ? "border-nature-500" : "border-nature-100 bg-white hover:border-nature-300 hover:bg-nature-50"
                            )}
                        >
                            {image ? (
                                <img src={image} alt="Upload" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-nature-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Camera size={40} className="text-nature-600" />
                                    </div>
                                    <p className="text-lg font-black text-nature-900 font-outfit">Sube una foto</p>
                                    <p className="text-xs text-earth-400 font-bold uppercase tracking-wider mt-1">Hojas, bichos o tallos sospechosos</p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {image && (
                            <button
                                onClick={runDiagnosis}
                                disabled={loading}
                                className="w-full h-16 bg-nature-900 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-nature-100 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Analizando ADN Bio...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} className="text-nature-300" />
                                        <span>Diagnosticar Plaga</span>
                                    </>
                                )}
                            </button>
                        )}

                        <div className="bg-nature-50 border border-nature-100 p-6 rounded-[2.5rem] flex gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                                <ShieldCheck size={24} className="text-nature-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-nature-900 text-sm">Protección Orgánica</h4>
                                <p className="text-xs text-earth-400 leading-relaxed font-medium mt-1">Nuestra IA está entrenada para detectar patógenos y recomendar soluciones 100% libres de químicos.</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 space-y-6"
                    >
                        {/* Result Card */}
                        <div className="bg-white rounded-[3rem] border border-nature-100 shadow-xl overflow-hidden">
                            <div className={clsx(
                                "p-8 text-white flex justify-between items-start",
                                result.severity === 'Alta' ? "bg-red-500" : "bg-nature-900"
                            )}>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Amenaza Detectada</span>
                                    <h3 className="text-4xl font-black font-outfit leading-none mt-1">{result.pest}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <AlertTriangle size={32} />
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-earth-300 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={12} /> Diagnóstico
                                    </label>
                                    <p className="text-sm font-bold text-nature-800 leading-relaxed">
                                        {result.diagnosis}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 bg-green-50 rounded-3xl border border-green-100 flex gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm h-fit text-green-600">
                                            <Leaf size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-green-900 text-xs uppercase tracking-widest">Solución Bio-Orgánica</h4>
                                            <p className="text-sm font-bold text-green-800 mt-1">{result.organicSolution}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm h-fit text-indigo-600">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest">Sabiduría del Mayordomo</h4>
                                            <p className="text-sm font-bold text-indigo-800 mt-1">{result.preventiveTip}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={reset}
                                    className="w-full py-4 rounded-2xl border-2 border-nature-100 text-nature-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-nature-50 transition-colors"
                                >
                                    Nuevo Análisis
                                </button>
                            </div>
                        </div>

                        <div className="bg-nature-900 text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-nature-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Zap size={20} className="text-nature-400" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Gravedad: <span className={result.severity === 'Alta' ? 'text-red-400' : 'text-nature-400'}>{result.severity}</span></span>
                            </div>
                            <CheckCircle2 size={24} className="text-nature-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PestRadar;
