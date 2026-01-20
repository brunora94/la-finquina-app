import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const VoiceInput = ({ onSpeechDetected, isListening: externalIsListening, placeholder = "Presiona para hablar..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            // Logic to stop handled by effect or native end
            return;
        }

        setError(null);
        setIsListening(true);

        // Simple implementation
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onSpeechDetected(transcript); // Send text back
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
            setError('No te entendí bien.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <button
                onClick={toggleListen}
                className={clsx(
                    "relative w-full p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 overflow-hidden",
                    isListening
                        ? "bg-red-50 border-red-200 text-red-600 scale-[1.02] shadow-inner"
                        : "bg-nature-50 border-nature-200 hover:border-nature-300 text-nature-700 hover:bg-nature-100 shadow-sm"
                )}
            >
                {isListening && (
                    <span className="absolute inset-0 bg-red-100/50 animate-pulse pointer-events-none" />
                )}

                <div className={clsx("p-4 rounded-full transition-colors z-10", isListening ? "bg-red-100 text-red-600" : "bg-white text-nature-600 shadow-sm")}>
                    {isListening ? <Mic className="animate-pulse" size={32} /> : <Mic size={32} />}
                </div>

                <span className="font-semibold text-lg z-10">
                    {isListening ? "Te escucho..." : "Dictar Tarea"}
                </span>
            </button>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
    );
};

export default VoiceInput;
