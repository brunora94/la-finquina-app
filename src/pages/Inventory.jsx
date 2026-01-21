import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Plus, DollarSign, X, Save, TrendingUp, Package, AlertTriangle, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const CATEGORIES = [
    { name: 'Semillas', color: '#10b981' },
    { name: 'Fertilizante', color: '#f59e0b' },
    { name: 'Gasolina', color: '#ef4444' },
    { name: 'Herramientas', color: '#64748b' },
];

const STOCK_UNITS = ['kg', 'sacos', 'litros', 'unidades', 'sobres'];

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'warehouse'
    const [expenses, setExpenses] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', category: 'Semillas', value: '', date: new Date().toISOString().split('T')[0] });
    const [newStockItem, setNewStockItem] = useState({ name: '', category: 'Semillas', quantity: '', unit: 'kg', min_stock: 1 });

    useEffect(() => {
        const fetchData = async () => {
            const { data: expData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
            const { data: stData } = await supabase.from('stock').select('*').order('name');

            if (expData) setExpenses(expData);
            if (stData) setStock(stData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleAddExpense = async () => {
        if (!newExpense.name || !newExpense.value) return;
        const expenseData = {
            name: newExpense.name,
            category: newExpense.category,
            value: parseFloat(newExpense.value),
            date: newExpense.date
        };
        const { data, error } = await supabase.from('expenses').insert([expenseData]).select();
        if (!error && data) setExpenses([data[0], ...expenses]);
        setIsFormOpen(false);
        setNewExpense({ name: '', category: 'Semillas', value: '', date: new Date().toISOString().split('T')[0] });
    };

    const handleAddStock = async () => {
        if (!newStockItem.name || !newStockItem.quantity) return;
        const stockData = {
            name: newStockItem.name,
            category: newStockItem.category,
            quantity: parseFloat(newStockItem.quantity),
            unit: newStockItem.unit,
            min_stock: parseFloat(newStockItem.min_stock)
        };
        const { data, error } = await supabase.from('stock').insert([stockData]).select();
        if (!error && data) setStock([...stock, data[0]]);
        setIsFormOpen(false);
        setNewStockItem({ name: '', category: 'Semillas', quantity: '', unit: 'kg', min_stock: 1 });
    };

    const removeExpense = async (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
        await supabase.from('expenses').delete().eq('id', id);
    };

    const removeStockItem = async (id) => {
        setStock(stock.filter(s => s.id !== id));
        await supabase.from('stock').delete().eq('id', id);
    };

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.value, 0);

    const chartData = CATEGORIES.map(cat => ({
        name: cat.name,
        value: expenses.filter(e => e.category === cat.name).reduce((acc, curr) => acc + curr.value, 0),
        color: cat.color
    })).filter(d => d.value > 0);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-nature-900 font-outfit tracking-tight">Recursos</h2>
                    <p className="text-earth-400 text-sm font-medium">Finanzas e Inventario</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="p-4 bg-nature-600 text-white rounded-3xl shadow-xl active:scale-95 transition-all"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-nature-100/50 rounded-3xl gap-1 mx-2">
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all text-sm",
                        activeTab === 'expenses' ? "bg-white text-nature-900 shadow-sm" : "text-nature-400"
                    )}
                >
                    <DollarSign size={18} /> Gasto Económico
                </button>
                <button
                    onClick={() => setActiveTab('warehouse')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all text-sm",
                        activeTab === 'warehouse' ? "bg-white text-nature-900 shadow-sm" : "text-nature-400"
                    )}
                >
                    <Package size={18} /> Almacén Físico
                </button>
            </div>

            {activeTab === 'expenses' ? (
                <>
                    {/* Summary Card */}
                    <div className="mx-2 p-8 bg-nature-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-nature-300 text-xs font-black uppercase tracking-widest">Inversión Total</p>
                            <h3 className="text-5xl font-black mt-2 font-outfit tracking-tighter">{totalExpense.toFixed(2)}€</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-white/5 rotate-12">
                            <TrendingUp size={160} />
                        </div>
                    </div>

                    {/* Chart Section */}
                    {chartData.length > 0 && (
                        <div className="mx-2 bg-white p-8 rounded-[2.5rem] border border-nature-100 shadow-sm relative">
                            <h3 className="text-nature-400 font-bold text-[10px] uppercase tracking-widest mb-6 px-1">Distribución del Gasto</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={10}
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
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-4 px-2">
                        <h3 className="font-black text-nature-900 uppercase tracking-widest text-xs ml-4 mb-2">Historial de Pagos</h3>
                        <AnimatePresence mode="popLayout">
                            {expenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-[2rem] border border-nature-100 p-5 flex justify-between items-center shadow-sm group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-nature-50 flex items-center justify-center text-nature-600 group-hover:bg-nature-600 group-hover:text-white transition-all duration-300">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-nature-900 text-lg leading-tight">{expense.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-earth-300 uppercase tracking-widest">{expense.date}</span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                <span className="text-[10px] font-black text-nature-400 uppercase">{expense.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-xl text-red-500 tracking-tighter">-{expense.value}€</span>
                                        <button onClick={() => removeExpense(expense.id)} className="p-2 text-gray-200 hover:text-red-400 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <div className="space-y-6 px-2">
                    {/* Alertas de Stock */}
                    {stock.some(s => s.quantity <= s.min_stock) && (
                        <div className="bg-yellow-50 border-2 border-yellow-100 rounded-[2rem] p-6 flex items-center gap-4">
                            <div className="p-3 bg-yellow-400 text-white rounded-2xl animate-pulse">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-yellow-900 uppercase tracking-widest text-[10px]">Alerta de Motor IA</h4>
                                <p className="text-yellow-800 text-sm font-medium">Quedan pocos suministros. Revisa tus existencias.</p>
                            </div>
                        </div>
                    )}

                    {/* Stock Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {stock.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2rem] border border-nature-100 p-6 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className={clsx(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                        CATEGORIES.find(c => c.name === item.category)?.color ? `bg-[${CATEGORIES.find(c => c.name === item.category)?.color}]` : "bg-nature-900"
                                    )} style={{ backgroundColor: CATEGORIES.find(c => c.name === item.category)?.color }}>
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-nature-900 text-xl tracking-tight">{item.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-nature-400 uppercase tracking-widest">{item.category}</span>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-earth-300">
                                                <Scale size={12} /> Min: {item.min_stock}{item.unit}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className={clsx(
                                            "text-3xl font-black font-outfit tracking-tighter",
                                            item.quantity <= item.min_stock ? "text-red-500" : "text-nature-900"
                                        )}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-xs font-black text-nature-400 ml-1 uppercase">{item.unit}</span>
                                    </div>
                                    <button onClick={() => removeStockItem(item.id)} className="p-2 text-gray-200 hover:text-red-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {stock.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-nature-100 rounded-[3rem]">
                                <Package className="mx-auto text-nature-100 mb-4" size={48} />
                                <p className="text-earth-300 font-bold">El almacén está vacío</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Combined Add Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[3rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-nature-900 font-outfit uppercase tracking-tight">
                                    {activeTab === 'expenses' ? 'Registrar Gasto' : 'Añadir al Almacén'}
                                </h3>
                                <X onClick={() => setIsFormOpen(false)} className="cursor-pointer text-gray-300" />
                            </div>

                            <div className="space-y-6">
                                {activeTab === 'expenses' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Concepto del Pago</label>
                                            <input type="text" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} className="input-elite" placeholder="Ej: Gasoil tractor" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Importe (€)</label>
                                                <input type="number" value={newExpense.value} onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })} className="input-elite text-2xl font-black" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Categoría</label>
                                                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="input-elite appearance-none">
                                                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Fecha de Operación</label>
                                            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="input-elite" />
                                        </div>
                                        <button onClick={handleAddExpense} className="btn-elite-black">
                                            <Save size={20} /> Guardar Movimiento
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Producto / Insumo</label>
                                            <input type="text" value={newStockItem.name} onChange={(e) => setNewStockItem({ ...newStockItem, name: e.target.value })} className="input-elite" placeholder="Ej: Abono NPK" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Cant. Existente</label>
                                                <input type="number" value={newStockItem.quantity} onChange={(e) => setNewStockItem({ ...newStockItem, quantity: e.target.value })} className="input-elite text-2xl font-black" placeholder="0" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Unidad</label>
                                                <select value={newStockItem.unit} onChange={(e) => setNewStockItem({ ...newStockItem, unit: e.target.value })} className="input-elite appearance-none">
                                                    {STOCK_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Categoría</label>
                                                <select value={newStockItem.category} onChange={(e) => setNewStockItem({ ...newStockItem, category: e.target.value })} className="input-elite appearance-none">
                                                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-earth-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                                                <input type="number" value={newStockItem.min_stock} onChange={(e) => setNewStockItem({ ...newStockItem, min_stock: e.target.value })} className="input-elite" />
                                            </div>
                                        </div>
                                        <button onClick={handleAddStock} className="btn-elite-black">
                                            <Save size={20} /> Añadir al Inventario
                                        </button>
                                    </>
                                )}
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
                .input-elite:focus {
                    outline: none;
                    background-color: white;
                    border-color: #32ad32;
                }
                .btn-elite-black {
                    width: 100%;
                    padding: 1.25rem;
                    background-color: #1a2e1a;
                    color: white;
                    border-radius: 1.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }
                .btn-elite-black:active {
                    scale: 0.95;
                }
            `}</style>
        </div>
    );
};

export default Inventory;
