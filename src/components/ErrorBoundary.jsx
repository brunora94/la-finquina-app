import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-earth-50 flex items-center justify-center p-6 text-center font-outfit">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-red-100 max-w-md w-full">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-nature-900 mb-4 uppercase tracking-tight">¡Vaya! Algo se ha enredado</h2>
                        <p className="text-earth-400 text-sm font-bold mb-8 leading-relaxed">
                            La app ha tenido un pequeño tropiezo técnico. No te preocupes, tus datos están a salvo en la finca.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-nature-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-95 transition-all shadow-xl"
                            >
                                <RefreshCw size={20} /> Reintentar Carga
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-nature-50 text-nature-900 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-nature-100 transition-all border border-nature-100"
                            >
                                <Home size={20} /> Ir al Inicio
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-nature-50">
                            <p className="text-[10px] font-black text-earth-200 uppercase tracking-widest leading-normal">
                                Error Técnico:<br />
                                <span className="opacity-60">{this.state.error?.message || "Error Desconocido"}</span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
