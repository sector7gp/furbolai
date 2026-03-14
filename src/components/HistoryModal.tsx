'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Hash, Loader2, ChevronRight, Users } from 'lucide-react';
import { posLabel, Player } from '@/lib/team-generator';

interface HistoryModalProps {
    onClose: () => void;
}

interface Draw {
    id: number;
    equipos_json: any;
    goles_eq1: number | null;
    goles_eq2: number | null;
    fecha_creacion: string;
}

export default function HistoryModal({ onClose }: HistoryModalProps) {
    const [draws, setDraws] = useState<Draw[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

    useEffect(() => {
        fetch('/api/draws')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDraws(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching history:', err);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="glass w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border-amber-500/30 shadow-2xl shadow-amber-500/10 flex flex-col">
                <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-7 h-7 text-amber-400" />
                        <div>
                            <h2 className="text-xl font-bold text-amber-300">Historial de Sorteos</h2>
                            <p className="text-sm text-amber-400/70">Consultá los equipos de fechas anteriores</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
                    {/* List */}
                    <div className="w-full md:w-1/3 border-r border-white/5 overflow-y-auto p-4 space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p>Cargando historial...</p>
                            </div>
                        ) : draws.length === 0 ? (
                            <p className="text-center py-12 text-gray-500 italic">No hay sorteos registrados aún.</p>
                        ) : (
                            draws.map(draw => (
                                <button
                                    key={draw.id}
                                    onClick={() => setSelectedDraw(draw)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group
                                        ${selectedDraw?.id === draw.id 
                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'}`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
                                            <Hash className="w-3 h-3" /> {draw.id}
                                        </div>
                                        <div className="font-bold text-sm">{formatDate(draw.fecha_creacion)}</div>
                                        {draw.goles_eq1 !== null && (
                                            <div className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded w-fit">
                                                {draw.goles_eq1} - {draw.goles_eq2}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedDraw?.id === draw.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Detail */}
                    <div className="flex-grow overflow-y-auto p-6 bg-black/20">
                        {selectedDraw ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Sorteo #{selectedDraw.id}</h3>
                                        <p className="text-gray-400">{formatDate(selectedDraw.fecha_creacion)}</p>
                                    </div>
                                    {selectedDraw.goles_eq1 !== null && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-center min-w-[100px]">
                                            <p className="text-[10px] uppercase font-bold text-emerald-500/60 mb-1">Resultado Final</p>
                                            <span className="text-2xl font-black text-emerald-400">
                                                {selectedDraw.goles_eq1} — {selectedDraw.goles_eq2}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedDraw.equipos_json.map((team: Player[], idx: number) => (
                                        <div key={idx} className="glass p-4 rounded-2xl border-white/5 bg-white/[0.03]">
                                            <h4 className="font-bold mb-3 flex items-center justify-between text-sm uppercase tracking-widest text-gray-500">
                                                <span>Equipo {idx + 1}</span>
                                                <span className="bg-white/5 px-2 py-1 rounded text-[10px]">{team.length} Jugadores</span>
                                            </h4>
                                            <div className="space-y-2">
                                                {team.map((p, i) => (
                                                    <div key={p.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-1 last:border-0">
                                                        <span className="font-semibold text-gray-300">{i+1}. {p.alias || p.jugador}</span>
                                                        <span className="font-mono text-gray-500 text-[10px] uppercase font-bold">{posLabel(p)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                <Users className="w-16 h-16 opacity-10" />
                                <p>Seleccioná un sorteo para ver los detalles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
