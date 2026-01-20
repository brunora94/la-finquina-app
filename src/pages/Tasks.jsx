import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    CheckCircle2,
    Circle,
    Plus,
    Calendar,
    Bot,
    MapPin,
    Settings,
    X,
    ChevronDown,
    Save
} from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'mantenimiento', label: 'Mantenimiento', icon: <Settings size={14} />, color: 'bg-orange-100 text-orange-700' },
    { id: 'cultivo', label: 'Cultivo', icon: <Calendar size={14} />, color: 'bg-green-100 text-green-700' },
    { id: 'inventario', label: 'Inventario', icon: <Plus size={14} />, color: 'bg-blue-100 text-blue-700' },
    { id: 'otros', label: 'Otros', icon: <ChevronDown size={14} />, color: 'bg-gray-100 text-gray-700' },
];

const FREQUENCIES = [
    { id: 'unica', label: 'Una sola vez' },
    { id: 'diaria', label: 'Diaria' },
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensual', label: 'Mensual' },
];

const Tasks = () => {
    // Load tasks from localStorage on initial render
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('finquina_tasks');
        return saved ? JSON.parse(saved) : [
            { id: 1, text: 'Comprar fertilizante para tomates', completed: false, category: 'inventario', frequency: 'unica', ai: false, section: 'Invernadero' },
            { id: 2, text: 'Revisar bomba de agua', completed: true, category: 'mantenimiento', frequency: 'semanal', ai: true, section: 'Pozo' },
        ];
    });

    // Save tasks to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem('finquina_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newTaskData, setNewTaskData] = useState({
        text: '',
        category: 'otros',
        frequency: 'unica',
        ai: false,
        section: ''
    });

    const openFormWithText = (text) => {
        setNewTaskData({ ...newTaskData, text: text.charAt(0).toUpperCase() + text.slice(1) });
        setIsFormOpen(true);
    };

    const handleAddTask = () => {
        if (!newTaskData.text.trim()) return;

        const task = {
            id: Date.now(),
            ...newTaskData,
            completed: false
        };

        setTasks([task, ...tasks]);
        setNewTaskData({ text: '', category: 'otros', frequency: 'unica', ai: false, section: '' });
        setIsFormOpen(false);
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-6 pb-24 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-nature-800 font-outfit">Gestión de Tareas</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-3 bg-nature-600 text-white rounded-full shadow-lg shadow-nature-100 active:scale-90 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Voice Quick Entry */}
            <section className="bg-white p-4 rounded-3xl shadow-sm border border-nature-100">
                <VoiceInput onSpeechDetected={openFormWithText} />
            </section>

            {/* Task List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={clsx(
                                "flex flex-col gap-3 p-4 rounded-3xl border transition-all relative overflow-hidden",
                                task.completed
                                    ? "bg-gray-50 border-transparent opacity-60"
                                    : "bg-white border-nature-100 shadow-sm hover:shadow-md"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <button onClick={() => toggleTask(task.id)} className="mt-1 transition-transform active:scale-75">
                                    {task.completed ? <CheckCircle2 size={26} className="text-green-500" /> : <Circle size={26} className="text-nature-300" />}
                                </button>

                                <div className="flex-1">
                                    <span className={clsx("text-lg font-medium block", task.completed ? "line-through text-gray-400" : "text-nature-900")}>
                                        {task.text}
                                    </span>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {task.category && (
                                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase",
                                                CATEGORIES.find(c => c.id === task.category)?.color)}>
                                                {CATEGORIES.find(c => c.id === task.category)?.icon}
                                                {CATEGORIES.find(c => c.id === task.category)?.label}
                                            </span>
                                        )}
                                        {task.section && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-earth-50 text-earth-600 font-bold flex items-center gap-1 uppercase border border-earth-100">
                                                <MapPin size={10} />
                                                {task.section}
                                            </span>
                                        )}
                                        {task.frequency !== 'unica' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-bold flex items-center gap-1 uppercase border border-purple-100">
                                                <Calendar size={10} />
                                                {FREQUENCIES.find(f => f.id === task.frequency)?.label}
                                            </span>
                                        )}
                                        {task.ai && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center gap-1 uppercase border border-indigo-100">
                                                <Bot size={10} />
                                                IA ACTIVA
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-earth-300">
                        <div className="bg-nature-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-nature-100">
                            <Plus size={40} className="text-nature-200" />
                        </div>
                        <p className="font-bold text-lg">No hay tareas</p>
                        <p className="text-sm">Todo está al día en La Finquina</p>
                    </motion.div>
                )}
            </div>

            {/* Advanced Task Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-nature-900 font-outfit">Nueva Tarea</h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-earth-400 uppercase tracking-widest pl-1">¿Qué hay que hacer?</label>
                                    <input
                                        type="text"
                                        value={newTaskData.text}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, text: e.target.value })}
                                        className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 focus:outline-none focus:ring-2 focus:ring-nature-500 font-medium"
                                        placeholder="Ej: Podar los limoneros"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-earth-400 uppercase tracking-widest pl-1">Categoría</label>
                                        <div className="relative">
                                            <select
                                                value={newTaskData.category}
                                                onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
                                                className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 appearance-none focus:outline-none focus:ring-2 focus:ring-nature-500"
                                            >
                                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-nature-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-earth-400 uppercase tracking-widest pl-1">Ubicación</label>
                                        <input
                                            type="text"
                                            value={newTaskData.section}
                                            onChange={(e) => setNewTaskData({ ...newTaskData, section: e.target.value })}
                                            className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 focus:outline-none focus:ring-2 focus:ring-nature-500"
                                            placeholder="Sector / Zona"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-4 bg-nature-50 rounded-2xl border border-nature-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-nature-900">Repetir tarea</p>
                                                <p className="text-xs text-earth-400">Automatiza la creación</p>
                                            </div>
                                        </div>
                                        <select
                                            value={newTaskData.frequency}
                                            onChange={(e) => setNewTaskData({ ...newTaskData, frequency: e.target.value })}
                                            className="bg-transparent font-bold text-sm text-nature-600 focus:outline-none"
                                        >
                                            {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-nature-50 rounded-2xl border border-nature-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <Bot size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-nature-900">Interacción IA</p>
                                                <p className="text-xs text-earth-400">La IA sugerirá mejoras</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNewTaskData({ ...newTaskData, ai: !newTaskData.ai })}
                                            className={clsx(
                                                "w-12 h-6 rounded-full relative transition-colors duration-300",
                                                newTaskData.ai ? "bg-indigo-600" : "bg-gray-300"
                                            )}
                                        >
                                            <div className={clsx(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                                                newTaskData.ai ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddTask}
                                    className="w-full p-4 bg-nature-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-nature-100 hover:bg-nature-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Guardar Tarea
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tasks;
