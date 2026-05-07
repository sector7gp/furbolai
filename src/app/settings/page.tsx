'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, 
    Save, 
    LayoutGrid, 
    Users, 
    Loader2, 
    Plus, 
    Trash2, 
    Shield, 
    CheckCircle2,
    X
} from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface Team {
    id: number;
    nombre: string;
    descripcion: string;
}

export default function SettingsPage() {
    const { user } = useUser();
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
    
    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [saved, setSaved] = useState(false);
    const [recalculating, setRecalculating] = useState(false);
    
    // New team form
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ nombre: '', descripcion: '' });
    const [creatingTeam, setCreatingTeam] = useState(false);

    useEffect(() => {
        // Fetch general settings
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

        // Fetch teams
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
            const res = await fetch('/api/teams');
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
        } finally {
            setLoadingTeams(false);
        }
    };

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

    const handleCreateTeam = async () => {
        if (!newTeam.nombre) return;
        setCreatingTeam(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeam)
            });
            if (res.ok) {
                setShowNewTeamModal(false);
                setNewTeam({ nombre: '', descripcion: '' });
                fetchTeams();
            }
        } catch (err) {
            console.error('Error creating team:', err);
        } finally {
            setCreatingTeam(false);
        }
    };

    const handleDeleteTeam = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este equipo? Esto no borrará a los jugadores, pero perderán su relación con el equipo.')) return;
        try {
            const res = await fetch('/api/teams', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                fetchTeams();
            }
        } catch (err) {
            console.error('Error deleting team:', err);
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-4 py-12">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-black gradient-text tracking-tight uppercase">Configuración</h1>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleRecalculate}
                        disabled={recalculating}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all border border-white/10 disabled:opacity-50 text-sm font-bold"
                    >
                        {recalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutGrid className="w-5 h-5" />}
                        Recalcular NGs
                    </button>
                    <button
                        onClick={save}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm font-bold"
                    >
                        {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saved ? 'Guardado' : 'Guardar'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Teams Section */}
                    <section className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">Equipos</h2>
                            </div>
                            {user?.role === 'Admin' && (
                                <button 
                                    onClick={() => setShowNewTeamModal(true)}
                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {loadingTeams ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                                </div>
                            ) : (
                                teams.map(team => (
                                    <div key={team.id} className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{team.nombre}</span>
                                            {team.descripcion && <span className="text-[10px] text-gray-500">{team.descripcion}</span>}
                                        </div>
                                        {user?.role === 'Admin' && (
                                            <button 
                                                onClick={() => handleDeleteTeam(team.id)}
                                                className="p-2 text-gray-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                            {teams.length === 0 && !loadingTeams && (
                                <p className="text-center text-xs text-gray-600 italic py-6">No hay equipos configurados.</p>
                            )}
                        </div>
                    </section>

                    {/* Distribution Section */}
                    <section className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Partida Semanal</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Equipos en el sorteo</label>
                                    <span className="text-2xl font-black text-emerald-400">{config.teamCount}</span>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="4"
                                    value={config.teamCount}
                                    onChange={e => setConfig(prev => ({ ...prev, teamCount: Number(e.target.value) }))}
                                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Algoritmo NG</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Pesos de Atributos</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { label: 'Estado Físico', key: 'w_fitness' },
                                        { label: 'Defensa', key: 'w_defensive' },
                                        { label: 'Fortaleza', key: 'w_strengths' },
                                        { label: 'Intensidad', key: 'w_intensity' }
                                    ].map(attr => (
                                        <div key={attr.key} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{attr.label}</label>
                                                <span className="text-xs font-black text-emerald-400">x{config[attr.key as keyof typeof config]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={config[attr.key as keyof typeof config]}
                                                onChange={e => setConfig(prev => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Curva de Edad</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 text-center">Peak In.</label>
                                        <input
                                            type="number"
                                            value={config.age_min}
                                            onChange={e => setConfig(prev => ({ ...prev, age_min: Number(e.target.value) }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-white text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 text-center">Peak Fin.</label>
                                        <input
                                            type="number"
                                            value={config.age_max}
                                            onChange={e => setConfig(prev => ({ ...prev, age_max: Number(e.target.value) }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-white text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 text-center">Decaim.</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={config.age_decay}
                                            onChange={e => setConfig(prev => ({ ...prev, age_decay: Number(e.target.value) }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-white text-center font-bold"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 mt-6 italic text-center px-4 leading-relaxed">
                                    * El decaimiento se aplica por cada año después del peak fin. (0.02 = 2% anual).
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* New Team Modal */}
            {showNewTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-black uppercase tracking-tight">Nuevo Equipo</h2>
                            <button onClick={() => setShowNewTeamModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={newTeam.nombre}
                                        onChange={e => setNewTeam(prev => ({ ...prev, nombre: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-white font-bold"
                                        placeholder="Ej: Veteranos A"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Descripción (Opcional)</label>
                                    <input
                                        type="text"
                                        value={newTeam.descripcion}
                                        onChange={e => setNewTeam(prev => ({ ...prev, descripcion: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                        placeholder="Descripción corta del grupo"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setShowNewTeamModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleCreateTeam}
                                    disabled={creatingTeam || !newTeam.nombre}
                                    className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creatingTeam ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CREAR'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
