import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Snowflake,
    Wrench,
    Leaf,
    X,
    ChevronRight,
    AlertCircle,
    Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const NotificationsCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        generateAlerts();
    }, []);

    const generateAlerts = async () => {
        const alerts = [];

        // 1. Frost Alert (Simulated from typical weather)
        const currentTemp = 4; // Simulated
        if (currentTemp < 5) {
            alerts.push({
                id: 'frost',
                type: 'danger',
                icon: <Snowflake size={20} />,
                title: 'Riesgo de Helada',
                text: 'Se esperan 4°C esta noche. Protege los semilleros con manta térmica.',
                color: 'bg-red-50 text-red-700 border-red-100'
            });
        }

        // 2. Machinery Alert
        const { data: machinery } = await supabase.from('machinery').select('*');
        const needsMaint = machinery?.some(m => m.hours_since_maintenance > 50);
        if (needsMaint) {
            alerts.push({
                id: 'maint',
                type: 'warning',
                icon: <Wrench size={20} />,
                title: 'Mantenimiento Pendiente',
                text: 'El Tractor John Deere ha superado las 50h de uso. Revisa el aceite.',
                color: 'bg-orange-50 text-orange-700 border-orange-100'
            });
        }

        // 3. Planting Alert
        alerts.push({
            id: 'planting',
            type: 'info',
            icon: <Leaf size={20} />,
            title: 'Día de Oro para Siembra',
            text: 'Luna creciente + Sol suave. Es el momento perfecto para plantar lechugas.',
            color: 'bg-green-50 text-green-700 border-green-100'
        });

        setNotifications(alerts);
    };

    if (notifications.length === 0 || isDismissed) return null;

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-nature-400" />
                    <h3 className="text-[10px] font-black text-earth-300 uppercase tracking-widest">Alertas Centinela</h3>
                </div>
                <button onClick={() => setIsDismissed(true)} className="text-[10px] font-bold text-nature-400 hover:text-nature-900">Descartar todo</button>
            </div>

            <AnimatePresence>
                {notifications.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.1 }}
                        className={clsx(
                            "p-4 rounded-3xl border flex gap-4 items-start relative group",
                            notif.color
                        )}
                    >
                        <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
                            {notif.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-sm leading-none mb-1">{notif.title}</h4>
                            <p className="text-xs font-bold opacity-80 leading-relaxed">{notif.text}</p>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                            className="p-1 opacity-0 group-hover:opacity-40 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsCenter;
