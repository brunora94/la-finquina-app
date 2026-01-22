import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Mic, ChevronDown } from 'lucide-react';
import { askButler } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const ButlerChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'assistant', text: '¡Hola! Soy el Mayordomo de La Finquina. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, isOpen]);

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userMsg = message;
        setMessage('');
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Fetch context for the Butler
            const { data: crops } = await supabase.from('crops').select('*');
            const { data: tasks } = await supabase.from('tasks').select('*').eq('status', 'pending');

            const context = {
                currentCrops: crops?.map(c => `${c.name} (${c.variety}) en Fila ${c.row_number}`),
                pendingTasks: tasks?.map(t => t.title),
                date: new Date().toLocaleDateString()
            };

            const response = await askButler(userMsg, context, chat);
            setChat(prev => [...prev, { role: 'assistant', text: response.answer }]);
        } catch (error) {
            setChat(prev => [...prev, { role: 'assistant', text: 'Lo siento, he tenido un pequeño lapsus. ¿Puedes repetir?' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Bubble */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={clsx(
                    "fixed bottom-24 right-6 z-[60] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all",
                    isOpen ? "opacity-0 pointer-events-none" : "bg-nature-900 text-white"
                )}
            >
                <div className="absolute inset-0 bg-nature-900 rounded-full animate-ping opacity-20" />
                <MessageSquare size={28} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[70] w-[90vw] max-w-[400px] h-[600px] bg-white rounded-[3rem] shadow-2xl border border-nature-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-nature-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black font-outfit leading-none">Mayordomo IA</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-nature-300">Experto Agrícola</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <ChevronDown size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-nature-50/30">
                            {chat.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={clsx(
                                        "max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "ml-auto bg-nature-900 text-white rounded-br-none"
                                            : "mr-auto bg-white text-nature-900 border border-nature-100 rounded-bl-none"
                                    )}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="mr-auto bg-white p-4 rounded-3xl border border-nature-100 flex gap-2">
                                    <span className="w-2 h-2 bg-nature-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-nature-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-nature-200 rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-nature-50">
                            <div className="flex items-center gap-2 bg-nature-50 rounded-2xl p-2 pr-4 border border-nature-100 focus-within:border-nature-900 transition-all">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Pregúntame algo..."
                                    className="flex-1 bg-transparent border-none outline-none p-2 text-sm font-bold text-nature-900"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || loading}
                                    className="p-2 bg-nature-900 text-white rounded-xl active:scale-90 transition-transform disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ButlerChat;
