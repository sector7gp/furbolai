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
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = () => {
        setLoading(true);
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

    const handleUpdatePlayer = async (player: Player) => {
        try {
            const res = await fetch('/api/players', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
            });
            if (res.ok) {
                setEditingPlayer(null);
                fetchPlayers();
            }
        } catch (err) {
            console.error('Error updating player:', err);
        }
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
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
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

            {editingPlayer && (
                <EditModal
                    player={editingPlayer}
                    onClose={() => setEditingPlayer(null)}
                    onSave={handleUpdatePlayer}
                />
            )}
        </main>
    );
}

function EditModal({ player, onClose, onSave }: { player: Player, onClose: () => void, onSave: (p: Player) => void }) {
    const [formData, setFormData] = useState<Player>({ ...player });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Editar: <span className="text-emerald-400">{player.alias || player.jugador}</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value as 'A' | 'I' })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="A" className="bg-gray-900 text-white">Activo (A)</option>
                                <option value="I" className="bg-gray-900 text-white">Inactivo (I)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Intensidad (I)</label>
                            <input
                                type="number"
                                value={formData.intensidad}
                                onChange={e => setFormData({ ...formData, intensidad: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Nivel General (NG)</label>
                            <input
                                type="number"
                                value={formData.ng}
                                onChange={e => setFormData({ ...formData, ng: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Estado Físico (EF)</label>
                            <input
                                type="number"
                                value={formData.ef}
                                onChange={e => setFormData({ ...formData, ef: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Cap. Ofensiva (CO)</label>
                            <input
                                type="number"
                                value={formData.co}
                                onChange={e => setFormData({ ...formData, co: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Cap. Defensiva (CD)</label>
                            <input
                                type="number"
                                value={formData.cd}
                                onChange={e => setFormData({ ...formData, cd: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Posiciones (sep. por coma)</label>
                        <input
                            type="text"
                            value={formData.posiciones}
                            onChange={e => setFormData({ ...formData, posiciones: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                        />
                    </div>
                </div>

                <div className="p-6 bg-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Save className="w-4 h-4" />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
