'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, User, Phone, Mail, Calendar, MapPin, Hash, AlertTriangle } from 'lucide-react';
import { useUser } from './UserContext';

interface PlayerData {
    id: number;
    player: string;
    mobil: string;
    alias: string;
    birth: string;
    pos: string;
    p_name?: string;
    mail?: string;
    t_id?: number;
    u_id?: string;
    fitness: number;
    defensive: number;
    strengths: number;
    intensity: number;
    ng: number;
    status: 'A' | 'I';
}

const POSITIONS = [
    { sigla: 'GK', label: 'Arquero' },
    { sigla: 'DF', label: 'Defensor Central' },
    { sigla: 'LI', label: 'Laterales (I)' },
    { sigla: 'LD', label: 'Laterales (D)' },
    { sigla: 'MC', label: 'Mediocampista' },
    { sigla: 'MI', label: 'Volantes (I)' },
    { sigla: 'MD', label: 'Volantes (D)' },
    { sigla: 'MP', label: 'Mediapunta' },
    { sigla: 'ST', label: 'Delantero' },
];

export default function ProfileModal({ onClose }: { onClose: () => void }) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<PlayerData | null>(null);

    const fetchPlayerData = useCallback(async () => {
        if (!user?.playerId) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/players`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const player = data.find(p => p.id === user.playerId);
                if (player) {
                    setFormData(player);
                }
            }
        } catch (err) {
            console.error('Error fetching player data:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.playerId]);

    useEffect(() => {
        fetchPlayerData();
    }, [fetchPlayerData]);

    const handleChange = (field: keyof PlayerData, value: any) => {
        if (!formData) return;
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleTogglePosition = (sigla: string) => {
        if (!formData) return;
        const currentPositions = formData.p_name ? formData.p_name.split(',').map(s => s.trim()).filter(Boolean) : [];
        let newPositions;
        if (currentPositions.includes(sigla)) {
            newPositions = currentPositions.filter(s => s !== sigla);
        } else {
            newPositions = [...currentPositions, sigla];
        }
        handleChange('p_name', newPositions.join(','));
    };

    const handleSave = async () => {
        if (!formData || saving) return;
        setSaving(true);
        try {
            const res = await fetch('/api/players', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Perfil actualizado correctamente');
                onClose();
            } else {
                alert('Error al actualizar el perfil');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-gray-400">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Perfil no encontrado</h2>
                        <p className="text-gray-400">Tu usuario no tiene un perfil de jugador vinculado. Contacta con un administrador.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl font-bold transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const isRestricted = user?.role === 'Jugador';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <User className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Mi Perfil</h2>
                            <p className="text-xs text-gray-400 lowercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Informacion Personal */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-4">Información Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.player}
                                        onChange={e => handleChange('player', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Alias / Apodo</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.alias}
                                        onChange={e => handleChange('alias', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-400 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Celular</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.mobil}
                                        onChange={e => handleChange('mobil', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={formData.mail || ''}
                                        onChange={e => handleChange('mail', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Fecha de Nacimiento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="date"
                                        value={formData.birth ? formData.birth.split('T')[0] : ''}
                                        onChange={e => handleChange('birth', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Documento (DNI/NIE)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.u_id || ''}
                                        readOnly={isRestricted}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none font-mono ${isRestricted ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-emerald-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posiciones */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-4">Mis Posiciones</h3>
                        <div className="flex flex-wrap gap-2">
                            {POSITIONS.map(pos => {
                                const isSelected = formData.p_name?.split(',').map(s => s.trim()).includes(pos.sigla);
                                return (
                                    <button
                                        key={pos.sigla}
                                        type="button"
                                        onClick={() => handleTogglePosition(pos.sigla)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            isSelected 
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                        }`}
                                    >
                                        {pos.sigla}
                                        <span className="block text-[8px] font-normal opacity-60 uppercase">{pos.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estadisticas Técnicas */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Estadísticas Técnicas</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'E. Físico', key: 'fitness', color: 'text-blue-400' },
                                { label: 'Defensa', key: 'defensive', color: 'text-gray-400' },
                                { label: 'Fortaleza', key: 'strengths', color: 'text-orange-400' },
                                { label: 'Intensidad', key: 'intensity', color: 'text-purple-400' },
                            ].map(stat => (
                                <div key={stat.key} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center group focus-within:border-emerald-500/50 transition-all">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">{stat.label}</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        value={(formData as any)[stat.key]}
                                        onChange={e => handleChange(stat.key as keyof PlayerData, Number(e.target.value))}
                                        className={`w-full bg-transparent text-center text-xl font-black ${stat.color} outline-none`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Nivel General (NG)</p>
                                <p className="text-xs text-emerald-500/60">Calculado en base a tus estadísticas y edad.</p>
                            </div>
                            <span className="text-3xl font-black text-emerald-400">{Number(formData.ng || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-bold text-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-3 bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}
