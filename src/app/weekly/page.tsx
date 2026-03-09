'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WeeklyPage() {
    const [fileContent, setFileContent] = useState<string>('');
    const [names, setNames] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setFileContent(text);
            processNames(text);
        };
        reader.readAsText(file);
    };

    const processNames = (text: string) => {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
        setNames(lines);
    };

    return (
        <main className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold gradient-text mb-8">Fútbol de la Semana</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="glass p-8 rounded-3xl border-white/10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-emerald-500" />
                        Cargar Lista (.txt)
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Sube el archivo con los nombres de los jugadores anotados para hoy. Uno por línea.
                    </p>

                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-gray-500 group-hover:text-emerald-400 transition-colors">
                            <Upload className="mx-auto w-12 h-12 mb-4" />
                            <p className="font-medium">Arrastra el archivo o haz clic aquí</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="block text-sm font-medium text-gray-400 mb-2">O pega el texto aquí:</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 h-40 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                            placeholder="Ej: Juan Perez&#10;Lionel Messi&#10;Cristiano Ronaldo..."
                            value={fileContent}
                            onChange={(e) => {
                                setFileContent(e.target.value);
                                processNames(e.target.value);
                            }}
                        />
                    </div>
                </section>

                <section className="glass p-8 rounded-3xl border-white/10 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                        <span>Jugadores Detectados</span>
                        <span className="text-emerald-500 text-sm">{names.length} detectados</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2">
                        {names.length === 0 ? (
                            <p className="text-gray-500 text-center italic mt-12">No hay nombres procesados.</p>
                        ) : (
                            names.map((name, i) => (
                                <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="font-medium text-sm">{name}</span>
                                    <div className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <button
                                            onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                                            className="text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        disabled={names.length === 0}
                        className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        Siguiente: Armar Equipos
                    </button>
                </section>
            </div>
        </main>
    );
}
