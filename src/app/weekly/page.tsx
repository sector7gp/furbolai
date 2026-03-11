'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ClipboardList, X, CheckCircle2, Trash2, Loader2, Users, Trophy, Download, Save, ChevronLeft } from 'lucide-react';
import { generateTeams, calculateTeamStats } from '@/lib/team-generator';
import html2canvas from 'html2canvas';

export default function WeeklyPage() {
    const [fileContent, setFileContent] = useState<string>('');
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<any[][] | null>(null);
    const [teamCount, setTeamCount] = useState(2);
    const [drawId, setDrawId] = useState<number | null>(null);
    const [goalsEq1, setGoalsEq1] = useState<string>('');
    const [goalsEq2, setGoalsEq2] = useState<string>('');
    const [savingGoals, setSavingGoals] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setTeamCount(data.teamCount || 2);
            })
            .catch(console.error);
    }, []);

    const processNames = (text: string) => {
        const lines = text.split('\n')
            .map(line => {
                // Remove numbers at start like "1. ", "1) ", etc.
                return line.trim().replace(/^[\d\.\)\-\s]+/, '').trim();
            })
            // Filter out empty lines, comments, or lines that are just symbols
            .filter(line => line.length > 1 && !line.startsWith('#') && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(line));
        
        // Remove duplicates case-insensitive
        const uniqueLines: string[] = [];
        const seen = new Set();
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueLines.push(line);
            }
        });
        
        setNames(uniqueLines);
    };

    const clearAll = () => {
        setFileContent('');
        setNames([]);
        setTeams(null);
        setDrawId(null);
        setGoalsEq1('');
        setGoalsEq2('');
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

            const defaultPlayers = (missing || []).map((name: string, i: number) => ({
                id: -1 - i,
                jugador: name,
                ng: 5.0,
                fitness: 5,
                defensive: 5,
                strengths: 5,
                intensity: 5,
                status: 'A'
            }));

            const allPlayers = [...players, ...defaultPlayers];
            const result = generateTeams(allPlayers, teamCount);
            setTeams(result);

            // Save draw to DB
            const drawRes = await fetch('/api/draws', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teams: result })
            });
            const drawData = await drawRes.json();
            if (drawData.id) {
                setDrawId(drawData.id);
            }
        } catch (err) {
            console.error('Error generating teams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoals = async () => {
        if (!drawId) return;
        setSavingGoals(true);
        try {
            await fetch('/api/draws', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: drawId,
                    goles_eq1: goalsEq1 ? parseInt(goalsEq1) : null,
                    goles_eq2: goalsEq2 ? parseInt(goalsEq2) : null
                })
            });
            alert('¡Resultado guardado!');
        } catch (err) {
            console.error('Error saving goals:', err);
        } finally {
            setSavingGoals(false);
        }
    };

    const exportAsJPG = async () => {
        if (!exportRef.current) return;
        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                backgroundColor: '#0a0a0a',
                logging: false
            });

            const image = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.href = image;
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `furbolai_equipos_${dateStr}.jpg`;
            link.click();
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    if (teams) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Equipos Equilibrados</h1>
                            <p className="text-gray-400 text-sm">Sorteo guardado {drawId ? `(#${drawId})` : ''}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportAsJPG}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Exportar JPG
                        </button>
                        <button
                            onClick={() => { setTeams(null); setDrawId(null); }}
                            className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl transition-all border border-white/5"
                        >
                            Volver
                        </button>
                    </div>
                </header>

                <div className={`grid grid-cols-1 ${teamCount >= 2 ? 'md:grid-cols-2' : ''} ${teamCount === 3 ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
                    {teams.map((team, idx) => {
                        const stats = calculateTeamStats(team);
                        const isWhite = idx === 0;
                        return (
                            <div key={idx} className={`glass p-6 rounded-3xl border-white/5 relative overflow-hidden group ${isWhite && teamCount === 2 ? 'bg-white/5' : 'bg-black/20'}`}>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isWhite && teamCount === 2 ? 'bg-white text-black' : 'bg-black text-white border border-white/20'}`}>
                                        {idx + 1}
                                    </span>
                                    {teamCount === 2 ? (isWhite ? "Blanco" : "Negro") : `Equipo ${idx + 1}`}
                                    <div className="ml-auto bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-2xl text-sm font-black border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex flex-col items-center leading-tight">
                                        <span className="text-[10px] uppercase opacity-60 tracking-tighter">Promedio NG</span>
                                        {stats.avgNG.toFixed(1)}
                                    </div>
                                </h3>

                                <div className="space-y-1 mb-6">
                                    {team.map((p, i) => (
                                        <div key={p.id} className="flex justify-between items-center py-1.5 px-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                                            <span className="font-semibold text-sm truncate max-w-[120px]">
                                                {i + 1}. {p.alias || p.jugador}
                                            </span>
                                            <div className="flex items-center gap-2 font-mono text-[11px]">
                                                <span className="text-gray-500 font-bold w-12 text-left overflow-hidden whitespace-nowrap" title="Posición">
                                                    {p.p_name || p.pos?.split(',')[0]?.toUpperCase() || '-'}
                                                </span>
                                                <span className="text-blue-400 w-4 text-center" title="EF">{Math.round(p.fitness ?? 5)}</span>
                                                <span className="text-gray-400 w-4 text-center" title="CD">{Math.round(p.defensive ?? 5)}</span>
                                                <span className="text-orange-400 w-4 text-center" title="F">{Math.round(p.strengths ?? 5)}</span>
                                                <span className="text-purple-400 w-4 text-center" title="INT">{Math.round(p.intensity ?? 5)}</span>
                                                <span className="text-emerald-400 font-bold ml-1 bg-emerald-400/10 px-1.5 py-0.5 rounded min-w-[32px] text-center shadow-inner">
                                                    {Number(p.ng || 5).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controles de Resultado */}
                {teamCount === 2 && drawId && (
                    <div className="glass p-6 rounded-3xl border-white/5 max-w-xl mx-auto text-center">
                        <h3 className="text-lg font-bold mb-4">Ingresar Resultado (Opcional)</h3>
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <div className="flex flex-col items-center">
                                <label className="text-xs text-gray-400 mb-2">Blanco</label>
                                <input type="number" value={goalsEq1} onChange={e => setGoalsEq1(e.target.value)} className="w-16 h-16 text-center text-2xl font-bold bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                            </div>
                            <span className="text-2xl font-bold text-gray-600">VS</span>
                            <div className="flex flex-col items-center">
                                <label className="text-xs text-gray-400 mb-2">Negro</label>
                                <input type="number" value={goalsEq2} onChange={e => setGoalsEq2(e.target.value)} className="w-16 h-16 text-center text-2xl font-bold bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                            </div>
                        </div>
                        <button onClick={handleSaveGoals} disabled={savingGoals} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50">
                            {savingGoals ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Guardar Resultado
                        </button>
                    </div>
                )}

                {/* HIDDEN EXPORT COMPONENT */}
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                    <div ref={exportRef} style={{ width: '800px', backgroundColor: '#0a0a0a', color: '#ffffff', padding: '48px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#34d399', margin: 0 }}>FurbolAI</h2>
                            <p style={{ fontSize: '20px', color: '#9ca3af', fontWeight: 500, margin: 0 }}>Sorteo del {new Date().toLocaleDateString('es-ES')}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                            {teams.slice(0, 2).map((team, idx) => (
                                <div key={idx} style={{ padding: '32px', borderRadius: '24px', backgroundColor: idx === 0 ? 'rgba(255,255,255,0.1)' : '#000000', border: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center', color: idx === 0 ? '#ffffff' : '#aaaaaa', marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {idx === 0 ? 'Equipo Blanco' : 'Equipo Negro'}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '20px' }}>
                                        {team.map((p, i) => (
                                            <li key={p.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ color: '#10b981', fontWeight: 900, width: '28px' }}>{i + 1}.</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '22px' }}>{p.alias || p.jugador}</span>
                                                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800 }}>{p.p_name || p.pos?.split(',')[0] || '-'}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* Average NG Badge - FULL WIDTH */}
                                    <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '20px', borderRadius: '20px', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '2px', opacity: 0.8 }}>PROMEDIO NG</span>
                                        <span style={{ fontSize: '32px', fontWeight: 900 }}>{calculateTeamStats(team).avgNG.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Pégalo y Armá</h1>
                        <p className="text-gray-400 text-sm">Pega la lista de WhatsApp o texto aquí abajo.</p>
                    </div>
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
