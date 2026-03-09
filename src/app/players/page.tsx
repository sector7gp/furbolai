'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Search, Loader2, Edit2, X, Save } from 'lucide-react';

interface Player {
    id: number;
    jugador: string;
    alias: string;
    fecha_nacimiento: string;
    posiciones: string;
    ng: number;
    ef: number;
    co: number;
    cd: number;
    intensidad: number;
    estado: 'A' | 'I';
}

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = (showLoading = true) => {
        if (showLoading) setLoading(true);
        fetch('/api/players')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPlayers(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching players:', err);
                setLoading(false);
            });
    };

    const handleCreatePlayer = async (newPlayerData: Partial<Player>) => {
        setSaving(true);
        try {
            const res = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPlayerData,
                    posiciones: '',
                    ng: 5,
                    ef: 5,
                    co: 5,
                    cd: 5,
                    intensidad: 5,
                    estado: 'A'
                }),
            });

            if (res.ok) {
                const savedPlayer = await res.json();
                setPlayers(prev => [...prev, savedPlayer]);
                setIsCreating(false);
                setEditingPlayer(savedPlayer); // Transition to auto-save modal
            }
        } catch (err) {
            console.error('Error creating player:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePlayer = async (player: Player) => {
        if (saving) return; // Prevent concurrent saves
        setSaving(true);

        try {
            const isNew = !player.id;
            const res = await fetch('/api/players', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
            });

            if (res.ok) {
                if (isNew) {
                    const savedPlayer = await res.json();
                    setEditingPlayer(savedPlayer); // SYNC ID BACK TO MODAL
                    setPlayers(prev => [...prev, savedPlayer]); // Add to list
                } else {
                    setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
                }
            } else {
                fetchPlayers(false); // Sync back on server error
            }
        } catch (err) {
            console.error('Error updating player:', err);
            fetchPlayers(false); // Sync back on catch
        } finally {
            setSaving(false);
        }
    };

    const createNewPlayer = () => {
        setIsCreating(true);
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const filteredPlayers = players.filter(p =>
        (p.alias && p.alias.toLowerCase().includes(search.toLowerCase())) ||
        p.jugador.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold gradient-text">Gestión de Jugadores</h1>
                <button
                    onClick={createNewPlayer}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Jugador
                </button>
            </div>

            <div className="glass p-6 rounded-2xl mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por alias o nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden overflow-x-auto border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Alias</th>
                            <th className="px-6 py-4 font-semibold text-center">Edad</th>
                            <th className="px-6 py-4 font-semibold">Posiciones</th>
                            <th className="px-6 py-4 font-semibold text-center">NG</th>
                            <th className="px-6 py-4 font-semibold text-center">EF</th>
                            <th className="px-6 py-4 font-semibold text-center">CO/CD</th>
                            <th className="px-6 py-4 font-semibold text-center">I</th>
                            <th className="px-6 py-4 font-semibold text-center">Est.</th>
                            <th className="px-6 py-4 font-semibold text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                        <span>Cargando jugadores...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 italic">
                                    No se encontraron jugadores.
                                </td>
                            </tr>
                        ) : filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-medium text-emerald-400">{player.alias || player.jugador}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{calculateAge(player.fecha_nacimiento)}</td>
                                <td className="px-6 py-4 text-gray-400 text-sm">{player.posiciones || '-'}</td>
                                <td className="px-6 py-4 text-center font-bold">{Math.round(player.ng)}</td>
                                <td className="px-6 py-4 text-center text-blue-400">{Math.round(player.ef)}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{Math.round(player.co)}/{Math.round(player.cd)}</td>
                                <td className="px-6 py-4 text-center text-orange-400">{Math.round(player.intensidad)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block w-8 py-1 rounded-md text-sm font-bold ${player.estado === 'A' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {player.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setEditingPlayer(player)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isCreating && (
                <NewPlayerModal
                    onClose={() => setIsCreating(false)}
                    onSave={handleCreatePlayer}
                    saving={saving}
                />
            )}

            {editingPlayer && (
                <EditModal
                    player={editingPlayer}
                    onClose={() => setEditingPlayer(null)}
                    onSave={handleUpdatePlayer}
                    saving={saving}
                />
            )}
        </main>
    );
}

function NewPlayerModal({ onClose, onSave, saving }: { onClose: () => void, onSave: (p: Partial<Player>) => void, saving: boolean }) {
    const [nombre, setNombre] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');

    const handleSubmit = () => {
        if (!nombre) return;
        onSave({ jugador: nombre, fecha_nacimiento: fechaNacimiento });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold">Nuevo Jugador</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 ml-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            placeholder="Ej: Juan Pérez"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 ml-1">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            value={fechaNacimiento}
                            onChange={e => setFechaNacimiento(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>

                <div className="p-6 bg-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !nombre}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditModal({ player, onClose, onSave, saving }: { player: Player, onClose: () => void, onSave: (p: Player) => void, saving: boolean }) {
    const [formData, setFormData] = useState<Player>({ ...player });

    // Important: sync ID if it changes (from 0 to server ID)
    useEffect(() => {
        if (player.id !== formData.id) {
            setFormData(prev => ({ ...prev, id: player.id }));
        }
    }, [player.id, formData.id]);

    // Auto-save logic: Trigger onSave whenever formData changes
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only trigger if data actually changed compared to the CURRENT player state
            if (JSON.stringify(formData) !== JSON.stringify(player)) {
                onSave(formData);
            }
        }, 800); // Slightly longer debounce for stability
        return () => clearTimeout(timer);
    }, [formData, onSave, player]);

    const handleChange = (field: keyof Player, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold">Editar: <span className="text-emerald-400">{player.alias || player.jugador}</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.jugador}
                                onChange={e => handleChange('jugador', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Alias</label>
                            <input
                                type="text"
                                value={formData.alias}
                                onChange={e => handleChange('alias', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="Ej: Juancho"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Estado del Jugador</span>
                            <span className="text-xs text-gray-400">{formData.estado === 'A' ? 'Activo (Participa en sorteos)' : 'Inactivo (No disponible)'}</span>
                        </div>
                        <button
                            onClick={() => handleChange('estado', formData.estado === 'A' ? 'I' : 'A')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.estado === 'A' ? 'bg-emerald-600' : 'bg-red-900/40'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.estado === 'A' ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.fecha_nacimiento ? formData.fecha_nacimiento.split('T')[0] : ''}
                                onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white appearance-none"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Intensidad (I)</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.intensidad)}
                                onChange={e => handleChange('intensidad', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Nivel General (NG)</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.ng)}
                                onChange={e => handleChange('ng', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Estado Físico (EF)</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.ef)}
                                onChange={e => handleChange('ef', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Cap. Ofensiva (CO)</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.co)}
                                onChange={e => handleChange('co', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Cap. Defensiva (CD)</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.cd)}
                                onChange={e => handleChange('cd', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Posiciones (sep. por coma)</label>
                            <input
                                type="text"
                                value={formData.posiciones}
                                onChange={e => handleChange('posiciones', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="GK, MC, ST..."
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white/5 text-center">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        {saving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Cambios guardados automáticamente
                            </>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
