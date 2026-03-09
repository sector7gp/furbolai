import { useState, useEffect } from 'react';
import { ClipboardList, X, CheckCircle2, Trash2, Loader2, Users, Trophy } from 'lucide-react';
import { generateTeams, calculateTeamStats } from '@/lib/team-generator';

export default function WeeklyPage() {
    const [fileContent, setFileContent] = useState<string>('');
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<any[][] | null>(null);
    const [teamCount, setTeamCount] = useState(2);

    useEffect(() => {
        const local = localStorage.getItem('furbolai_config');
        if (local) {
            setTeamCount(JSON.parse(local).teamCount || 2);
        }
    }, []);

    const processNames = (text: string) => {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#') && isNaN(Number(line.charAt(0))));
        setNames(lines);
    };

    const clearAll = () => {
        setFileContent('');
        setNames([]);
        setTeams(null);
    };

    const handleGenerateTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/match-players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ names }),
            });
            const { players, missing } = await res.json();

            // For missing players, create a default player object
            const defaultPlayers = (missing || []).map((name: string, i: number) => ({
                id: -1 - i,
                jugador: name,
                ng: 5,
                ef: 5,
                co: 5,
                cd: 5,
                intensidad: 5,
                posiciones: ''
            }));

            const allPlayers = [...players, ...defaultPlayers];
            const result = generateTeams(allPlayers, teamCount);
            setTeams(result);
        } catch (err) {
            console.error('Error generating teams:', err);
        } finally {
            setLoading(false);
        }
    };

    if (teams) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-12">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Equipos Equilibrados</h1>
                        <p className="text-gray-400 text-sm">Basado en estadísticas y nivel general.</p>
                    </div>
                    <button
                        onClick={() => setTeams(null)}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl transition-all border border-white/5"
                    >
                        Volver a editar lista
                    </button>
                </header>

                <div className={`grid grid-cols-1 md:grid-cols-${teamCount === 2 ? '2' : '3'} gap-6`}>
                    {teams.map((team, idx) => {
                        const stats = calculateTeamStats(team);
                        return (
                            <div key={idx} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <Trophy className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm">
                                        {idx + 1}
                                    </span>
                                    Equipo {idx + 1}
                                </h3>

                                <div className="space-y-3 mb-8">
                                    {team.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="font-medium">{p.alias || p.jugador}</span>
                                            <span className="text-xs bg-black/40 px-2 py-1 rounded text-gray-400 font-bold">{Math.round(p.ng)} NG</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-tighter text-gray-500 border-t border-white/5 pt-4">
                                    <div className="flex justify-between">
                                        <span>AVG NG</span>
                                        <span className="text-emerald-500 font-bold">{stats.avgNG.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>AVG EF</span>
                                        <span className="text-blue-400 font-bold">{stats.avgEF.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Pégalo y Armá</h1>
                    <p className="text-gray-400 text-sm">Pega la lista de WhatsApp o texto aquí abajo.</p>
                </div>
                {names.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                        title="Limpiar todo"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                )}
            </header>

            <section className="space-y-6">
                <div className="glass p-4 rounded-2xl border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                    <textarea
                        className="w-full bg-transparent border-none rounded-xl p-2 h-64 focus:ring-0 outline-none transition-all text-lg placeholder:text-gray-600 font-medium"
                        placeholder="Pegar lista aquí...&#10;Ej:&#10;Juancho&#10;Leo Messi&#10;Fideo..."
                        value={fileContent}
                        onChange={(e) => {
                            setFileContent(e.target.value);
                            processNames(e.target.value);
                        }}
                    />
                </div>

                {names.length > 0 && (
                    <div className="glass p-6 rounded-2xl border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                Listos para el sorteo
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">
                                {names.length}
                            </span>
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {names.map((name, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/5 group">
                                    <span className="text-sm font-medium">{name}</span>
                                    <button
                                        onClick={() => {
                                            const newNames = names.filter((_, idx) => idx !== i);
                                            setNames(newNames);
                                            setFileContent(newNames.join('\n'));
                                        }}
                                        className="text-gray-600 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerateTeams}
                            disabled={loading || names.length < teamCount}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ClipboardList className="w-6 h-6" />}
                            Siguiente: Ver Equipos
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
