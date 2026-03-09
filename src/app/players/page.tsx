'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Search, Loader2 } from 'lucide-react';

interface Player {
    id: number;
    jugador: string;
    alias: string;
    posiciones: string;
    ng: number;
    ef: number;
    co: number;
    cd: number;
    intensidad: number;
    fecha_baja: string | null;
}

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    const filteredPlayers = players.filter(p =>
        p.jugador.toLowerCase().includes(search.toLowerCase()) ||
        (p.alias && p.alias.toLowerCase().includes(search.toLowerCase()))
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
                        placeholder="Buscar por nombre o alias..."
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
                            <th className="px-6 py-4 font-semibold">Jugador</th>
                            <th className="px-6 py-4 font-semibold">Posiciones</th>
                            <th className="px-6 py-4 font-semibold text-center">NG</th>
                            <th className="px-6 py-4 font-semibold text-center">EF</th>
                            <th className="px-6 py-4 font-semibold text-center">CO/CD</th>
                            <th className="px-6 py-4 font-semibold text-center">I</th>
                            <th className="px-6 py-4 font-semibold">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                        <span>Cargando jugadores...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                    No se encontraron jugadores.
                                </td>
                            </tr>
                        ) : filteredPlayers.map((player) => (
                            <PlayerRow
                                key={player.id}
                                name={player.jugador}
                                pos={player.posiciones || '-'}
                                ng={Number(player.ng)}
                                ef={Number(player.ef)}
                                co={Number(player.co)}
                                cd={Number(player.cd)}
                                i={Number(player.intensidad)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

function PlayerRow({ name, pos, ng, ef, co, cd, i }: { name: string, pos: string, ng: number, ef: number, co: number, cd: number, i: number }) {
    return (
        <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
            <td className="px-6 py-4 font-medium">{name}</td>
            <td className="px-6 py-4 text-gray-400">{pos}</td>
            <td className="px-6 py-4 text-center font-bold text-emerald-400">{ng.toFixed(1)}</td>
            <td className="px-6 py-4 text-center text-blue-400">{ef.toFixed(1)}</td>
            <td className="px-6 py-4 text-center text-gray-400">{co.toFixed(1)}/{cd.toFixed(1)}</td>
            <td className="px-6 py-4 text-center text-orange-400">{i.toFixed(1)}</td>
            <td className="px-6 py-4">
                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-medium">Activo</span>
            </td>
        </tr>
    );
}
