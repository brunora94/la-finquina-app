import React from 'react';
import { Moon } from 'lucide-react';
import { Moon as LunarCalc } from 'lunarphase-js';

const MoonWidget = () => {
    const phaseEmoji = LunarCalc.lunarPhaseEmoji();
    const phaseName = LunarCalc.lunarPhase();
    const age = LunarCalc.lunarAge(); // Days since new moon

    // Custom translation map for Spanish
    const translatePhase = (name) => {
        const map = {
            'New': 'Luna Nueva',
            'Waxing Crescent': 'Luna Creciente',
            'First Quarter': 'Cuarto Creciente',
            'Waxing Gibbous': 'Gibosa Creciente',
            'Full': 'Luna Llena',
            'Waning Gibbous': 'Gibosa Menguante',
            'Last Quarter': 'Cuarto Menguante',
            'Waning Crescent': 'Luna Menguante'
        };
        return map[name] || name;
    };

    const isGrowing = age < 15; // Roughly

    return (
        <div className="card-premium bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700/50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-400 font-medium uppercase tracking-wider text-xs">Fase Lunar</h3>
                    <p className="text-slate-300 text-sm mt-1">Ideal para {isGrowing ? 'sembrar (hojas/frutos)' : 'podar/raíces'}</p>
                </div>
                <Moon className="text-yellow-100" size={20} />
            </div>

            <div className="flex items-center gap-6">
                <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {phaseEmoji}
                </div>
                <div>
                    <h4 className="text-2xl font-bold text-white mb-1">{translatePhase(phaseName)}</h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                        <span className={`w-2 h-2 rounded-full ${isGrowing ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-xs font-medium text-slate-200">
                            {isGrowing ? 'Creciendo' : 'Menguando'} ({Math.round(age)} días)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoonWidget;
