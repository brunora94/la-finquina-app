import React from 'react';
import { motion } from 'framer-motion';
import WeatherWidget from '../components/WeatherWidget';
import MoonWidget from '../components/MoonWidget';
import RainWidget from '../components/RainWidget';
import PredictiveCalendar from '../components/PredictiveCalendar';
import NotificationsCenter from '../components/NotificationsCenter';
import { ClipboardList, Sprout, TrendingUp, Bug, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

const Dashboard = ({ onNavigate }) => {
    useEffect(() => {
        const handleNav = (e) => onNavigate(e.detail);
        window.addEventListener('navigate', handleNav);
        return () => window.removeEventListener('navigate', handleNav);
    }, [onNavigate]);

    return (
        <div className="space-y-6">
            <NotificationsCenter />

            {/* Top Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <WeatherWidget />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <RainWidget />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <MoonWidget />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <PredictiveCalendar />
                </motion.div>
            </div>

            {/* Navigation Cards */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                <button
                    onClick={() => onNavigate('tasks')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-nature-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 text-left group"
                >
                    <div className="p-4 bg-nature-100 text-nature-600 rounded-2xl group-hover:bg-nature-600 group-hover:text-white transition-colors">
                        <ClipboardList size={32} />
                    </div>
                    <div>
                        <span className="block font-bold text-nature-900 text-xl font-outfit">Mis Tareas</span>
                        <span className="text-earth-400 text-sm">Gestionar hoy</span>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('crops')}
                    className="bg-nature-800 p-6 rounded-3xl shadow-lg shadow-nature-200 flex items-center gap-5 hover:bg-nature-950 hover:-translate-y-1 transition-all active:scale-95 text-left group"
                >
                    <div className="p-4 bg-white/10 text-white rounded-2xl group-hover:bg-white group-hover:text-nature-900 transition-colors">
                        <Sprout size={32} />
                    </div>
                    <div>
                        <span className="block font-bold text-white text-xl font-outfit">Mis Cultivos</span>
                        <span className="text-nature-200/60 text-sm">Estado e IA</span>
                    </div>
                </button>

                {/* NEW ELITE CARDS */}
                <button
                    onClick={() => onNavigate('pest-radar')}
                    className="bg-red-50 p-6 rounded-3xl shadow-sm border border-red-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 text-left group"
                >
                    <div className="p-4 bg-red-100 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Bug size={32} />
                    </div>
                    <div>
                        <span className="block font-bold text-red-900 text-xl font-outfit">Radar Plagas</span>
                        <span className="text-red-400 text-sm">Escáner Bio-Guardian</span>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('marketplace')}
                    className="bg-indigo-50 p-6 rounded-3xl shadow-sm border border-indigo-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 text-left group"
                >
                    <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <span className="block font-bold text-indigo-900 text-xl font-outfit">Excedentes</span>
                        <span className="text-indigo-400 text-sm">Tablón Comunitario</span>
                    </div>
                </button>
            </motion.div>
        </div>
    );
};

export default Dashboard;
