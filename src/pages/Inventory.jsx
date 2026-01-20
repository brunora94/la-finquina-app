import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Plus, DollarSign, X, Save, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
    { name: 'Semillas', color: '#10b981' },
    { name: 'Fertilizante', color: '#f59e0b' },
    { name: 'Gasolina', color: '#ef4444' },
    { name: 'Herramientas', color: '#64748b' },
];

const Inventory = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (!error) {
                if (data && data.length > 0) {
                    setExpenses(data);
                } else {
                    // MIGRATION: If cloud is empty, check local storage
                    const saved = localStorage.getItem('finquina_expenses');
                    if (saved) {
                        const localData = JSON.parse(saved);
                        if (localData.length > 0) {
                            console.log('Migrando gastos a la nube...');
                            const toUpload = localData.map(({ id, ...rest }) => rest);
                            const { data: uploaded } = await supabase
                                .from('expenses')
                                .insert(toUpload)
                                .select();
                            if (uploaded) setExpenses(uploaded);
                        }
                    }
                }
            } else {
                const saved = localStorage.getItem('finquina_expenses');
                if (saved) setExpenses(JSON.parse(saved));
            }
            setLoading(false);
        };
        fetchExpenses();
    }, []);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', category: 'Semillas', value: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        localStorage.setItem('finquina_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const handleAddExpense = async () => {
        if (!newExpense.name || !newExpense.value) return;

        const expenseData = {
            name: newExpense.name,
            category: newExpense.category,
            value: parseFloat(newExpense.value),
            date: newExpense.date
        };

        const tempId = Date.now();
        setExpenses([{ id: tempId, ...expenseData }, ...expenses]);
        setIsFormOpen(false);
        setNewExpense({ name: '', category: 'Semillas', value: '', date: new Date().toISOString().split('T')[0] });

        const { data, error } = await supabase
            .from('expenses')
            .insert([expenseData])
            .select();

        if (!error && data) {
            setExpenses(prev => prev.map(e => e.id === tempId ? data[0] : e));
        }
    };

    const removeExpense = async (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
        await supabase.from('expenses').delete().eq('id', id);
    };

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.value, 0);

    // Group expenses for chart
    const chartData = CATEGORIES.map(cat => ({
        name: cat.name,
        value: expenses.filter(e => e.category === cat.name).reduce((acc, curr) => acc + curr.value, 0),
        color: cat.color
    })).filter(d => d.value > 0);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-nature-800 font-outfit">Control de Gastos</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-3 bg-nature-600 text-white rounded-full shadow-lg active:scale-90 transition-all font-bold"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Summary Card */}
            <div className="card-premium flex items-center justify-between !bg-nature-900 text-white border-0">
                <div>
                    <p className="text-nature-300 text-xs font-bold uppercase tracking-widest">Gasto Total Acumulado</p>
                    <h3 className="text-4xl font-black mt-1 font-outfit">{totalExpense.toFixed(2)}€</h3>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                    <TrendingUp className="text-green-400" size={32} />
                </div>
            </div>

            {/* Chart Section */}
            {chartData.length > 0 && (
                <div className="bg-white p-6 rounded-[2.5rem] border border-nature-100 shadow-sm overflow-hidden h-80 relative">
                    <h3 className="text-nature-400 font-bold text-[10px] uppercase tracking-widest mb-4">Desglose por Categoría</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {chartData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                <h3 className="font-bold text-nature-800 px-2 flex items-center gap-2">
                    <TrendingDown size={18} className="text-red-400" />
                    Últimos Movimientos
                </h3>
                <AnimatePresence mode="popLayout">
                    {expenses.map((expense) => (
                        <motion.div
                            key={expense.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-nature-100 p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-nature-50 flex items-center justify-center text-nature-600 group-hover:bg-nature-100 transition-colors">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">{expense.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-bold text-earth-300 uppercase">{expense.date}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-bold uppercase tracking-tighter">{expense.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-lg text-red-500">-{expense.value}€</span>
                                <button onClick={() => removeExpense(expense.id)} className="p-2 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-nature-900 mb-6 font-outfit">Nuevo Gasto</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Concepto</label>
                                    <input
                                        type="text"
                                        value={newExpense.name}
                                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                                        className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 focus:outline-none focus:ring-2 focus:ring-nature-500"
                                        placeholder="Ej: Gasoil tractor"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Importe (€)</label>
                                        <input
                                            type="number"
                                            value={newExpense.value}
                                            onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                                            className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 focus:outline-none focus:ring-2 focus:ring-nature-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Categoría</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="w-full p-4 bg-nature-50 rounded-2xl border border-nature-100 appearance-none focus:outline-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddExpense}
                                    className="w-full p-4 bg-nature-900 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> Guardar Movimiento
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
