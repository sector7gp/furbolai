'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, LayoutGrid, Users, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [config, setConfig] = useState({
        teamCount: 2,
        w_fitness: 1,
        w_defensive: 1,
        w_strengths: 1,
        w_intensity: 1,
        age_min: 20,
        age_max: 32,
        age_decay: 0.02,
    });
    const [saved, setSaved] = useState(false);
    const [recalculating, setRecalculating] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setConfig({
                    teamCount: data.teamCount || 2,
                    w_fitness: data.w_fitness ?? 1,
                    w_defensive: data.w_defensive ?? 1,
                    w_strengths: data.w_strengths ?? 1,
                    w_intensity: data.w_intensity ?? 1,
                    age_min: data.age_min ?? 20,
                    age_max: data.age_max ?? 32,
                    age_decay: data.age_decay ?? 0.02,
                });
            })
            .catch(console.error);
    }, []);

    const save = async () => {
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleRecalculate = async () => {
        if (!confirm('Esto actualizará el NG de todos los jugadores según la configuración actual. ¿Continuar?')) return;
        setRecalculating(true);
        try {
            const res = await fetch('/api/players/recalculate', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`¡Éxito! Se actualizaron ${data.count} jugadores.`);
            }
        } catch (error) {
            console.error('Error recalculating:', error);
        } finally {
            setRecalculating(false);
        }
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
                <div className="flex gap-3">
                    <button
                        onClick={handleRecalculate}
                        disabled={recalculating}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg transition-all border border-white/10 disabled:opacity-50"
                    >
                        {recalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutGrid className="w-5 h-5" />}
                        Recalcular NGs
                    </button>
                    <button
                        onClick={save}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Save className="w-5 h-5" />
                        {saved ? 'Guardado' : 'Guardar Cambios'}
                    </button>
                </div>
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
                        </div>
                    </div>
                </section>

                <section className="glass p-8 rounded-3xl border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold">Cálculo de Nivel General (NG)</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Pesos de Atributos</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Estado Físico', key: 'w_fitness' },
                                    { label: 'Defensa', key: 'w_defensive' },
                                    { label: 'Fortaleza', key: 'w_strengths' },
                                    { label: 'Intensidad', key: 'w_intensity' }
                                ].map(attr => (
                                    <div key={attr.key}>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs text-gray-400">{attr.label}</label>
                                            <span className="text-xs font-bold text-emerald-400">{config[attr.key as keyof typeof config]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={config[attr.key as keyof typeof config]}
                                            onChange={e => setConfig(prev => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Curva de Edad</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Inicio Peak (Años)</label>
                                    <input
                                        type="number"
                                        value={config.age_min}
                                        onChange={e => setConfig(prev => ({ ...prev, age_min: Number(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Fin Peak (Años)</label>
                                    <input
                                        type="number"
                                        value={config.age_max}
                                        onChange={e => setConfig(prev => ({ ...prev, age_max: Number(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Decaimiento Anual</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.age_decay}
                                        onChange={e => setConfig(prev => ({ ...prev, age_decay: Number(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-4 italic">
                                * El decaimiento se aplica por cada año después del Fin de Peak. El valor 0.02 equivale a un 2% anual.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
