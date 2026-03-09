'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Search, Loader2, Edit2, X, Save, ChevronUp, ChevronDown, ChevronLeft } from 'lucide-react';

interface Player {
    id: number;
    jugador: string;
    celular: string;
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

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Player | 'age'; direction: 'asc' | 'desc' }>({
        key: 'estado',
        direction: 'asc'
    });

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
                    celular: newPlayerData.celular || '',
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
                setEditingPlayer(savedPlayer);
            }
        } catch (err) {
            console.error('Error creating player:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePlayer = async (player: Player) => {
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch('/api/players', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
            });

            if (res.ok) {
                setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
                if (editingPlayer?.id === player.id) {
                    setEditingPlayer(player);
                }
            } else {
                fetchPlayers(false);
            }
        } catch (err) {
            console.error('Error updating player:', err);
            fetchPlayers(false);
        } finally {
            setSaving(false);
        }
    };

    const calculateAgeNum = (birthDate: string) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSort = (key: keyof Player | 'age') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredPlayers = players
        .filter(p =>
            (p.alias && p.alias.toLowerCase().includes(search.toLowerCase())) ||
            p.jugador.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let valA: any = sortConfig.key === 'age' ? calculateAgeNum(a.fecha_nacimiento) : a[sortConfig.key as keyof Player];
            let valB: any = sortConfig.key === 'age' ? calculateAgeNum(b.fecha_nacimiento) : b[sortConfig.key as keyof Player];

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold gradient-text">Gestión de Jugadores</h1>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
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
                            <th className="px-6 py-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('alias')}>
                                <div className="flex items-center gap-1">
                                    Alias {sortConfig.key === 'alias' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('age')}>
                                <div className="flex items-center justify-center gap-1">
                                    Edad {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('posiciones')}>
                                <div className="flex items-center gap-1">
                                    Posiciones {sortConfig.key === 'posiciones' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('ng')}>
                                <div className="flex items-center justify-center gap-1">
                                    NG {sortConfig.key === 'ng' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('ef')}>
                                <div className="flex items-center justify-center gap-1">
                                    EF {sortConfig.key === 'ef' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('co')}>
                                <div className="flex items-center justify-center gap-1">
                                    CO/CD {sortConfig.key === 'co' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('intensidad')}>
                                <div className="flex items-center justify-center gap-1">
                                    I {sortConfig.key === 'intensidad' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('estado')}>
                                <div className="flex items-center justify-center gap-1">
                                    Est. {sortConfig.key === 'estado' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
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
                                <td className="px-6 py-4 text-center text-gray-400">{calculateAgeNum(player.fecha_nacimiento) || '-'}</td>
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
    const [celular, setCelular] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');

    const handleSubmit = () => {
        if (!nombre) return;
        onSave({ jugador: nombre, celular, fecha_nacimiento: fechaNacimiento });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold">Nuevo Jugador</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
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
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Celular</label>
                            <input
                                type="text"
                                value={celular}
                                onChange={e => setCelular(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="+34..."
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

    useEffect(() => {
        if (player.id !== formData.id) {
            setFormData(prev => ({ ...prev, id: player.id }));
        }
    }, [player.id, formData.id]);

    useEffect(() => {
        const isDifferent = JSON.stringify(formData) !== JSON.stringify(player);
        if (!isDifferent) return;

        const timer = setTimeout(() => {
            onSave(formData);
        }, 800);
        return () => clearTimeout(timer);
    }, [formData, onSave, player]);

    const handleChange = (field: keyof Player, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTogglePosition = (sigla: string) => {
        const currentPositions = formData.posiciones ? formData.posiciones.split(',').map(s => s.trim()).filter(Boolean) : [];
        let newPositions;
        if (currentPositions.includes(sigla)) {
            newPositions = currentPositions.filter(s => s !== sigla);
        } else {
            newPositions = [...currentPositions, sigla];
        }
        handleChange('posiciones', newPositions.join(','));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-xl rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold">Editar: <span className="text-emerald-400">{player.alias || player.jugador}</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
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
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Celular</label>
                            <input
                                type="text"
                                value={formData.celular || ''}
                                onChange={e => handleChange('celular', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="+34..."
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.fecha_nacimiento ? formData.fecha_nacimiento.split('T')[0] : ''}
                                onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                style={{ colorScheme: 'dark' }}
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

                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-2 ml-1">Posiciones</label>
                        <div className="grid grid-cols-3 gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                            {POSITIONS.map(pos => (
                                <label key={pos.sigla} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.posiciones.split(',').map(s => s.trim()).includes(pos.sigla)}
                                        onChange={() => handleTogglePosition(pos.sigla)}
                                        className="w-5 h-5 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{pos.sigla}</span>
                                        <span className="text-[9px] text-gray-500 uppercase mt-1">{pos.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">I</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.intensidad)}
                                onChange={e => handleChange('intensidad', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">NG</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.ng)}
                                onChange={e => handleChange('ng', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">EF</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.ef)}
                                onChange={e => handleChange('ef', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">CO</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.co)}
                                onChange={e => handleChange('co', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">CD</label>
                            <input
                                type="number"
                                step="1"
                                value={Math.round(formData.cd)}
                                onChange={e => handleChange('cd', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
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
