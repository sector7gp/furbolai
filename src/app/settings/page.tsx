'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, LayoutGrid, Users } from 'lucide-react';

export default function SettingsPage() {
    const [config, setConfig] = useState({
        teamCount: 2,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const local = localStorage.getItem('furbolai_config');
        if (local) {
            setConfig(JSON.parse(local));
        }
    }, []);

    const save = () => {
        localStorage.setItem('furbolai_config', JSON.stringify(config));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold gradient-text">Configuración</h1>
                </div>
                <button
                    onClick={save}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Save className="w-5 h-5" />
                    {saved ? 'Guardado' : 'Guardar Cambios'}
                </button>
            </header>

            <div className="space-y-6">
                <section className="glass p-8 rounded-3xl border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <LayoutGrid className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold">Distribución</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-sm font-medium text-gray-300">Cantidad de Equipos</label>
                                <span className="text-2xl font-bold text-emerald-400">{config.teamCount}</span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="4"
                                value={config.teamCount}
                                onChange={e => setConfig(prev => ({ ...prev, teamCount: Number(e.target.value) }))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                                <span>2 Equipos</span>
                                <span>3 Equipos</span>
                                <span>4 Equipos</span>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <p className="text-sm text-gray-400 italic">
                                Por ahora el sistema usará una distribución tipo "serpiente" basada en el Nivel General (NG) para equilibrar los equipos.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="glass p-8 rounded-3xl border-white/5 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold">Pesos de Algoritmo (Próximamente)</h2>
                    </div>
                    <p className="text-sm text-gray-500">Definí qué tan importante es el Estado Físico vs la Técnica para el balanceo.</p>
                </section>
            </div>
        </main>
    );
}
