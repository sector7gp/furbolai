'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Search, Loader2, Edit2, X, Save, ChevronUp, ChevronDown, ChevronLeft, RefreshCcw, LogOut, Shield, User } from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface Player {
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

function RadarChart({ stats, size = 32, showLabels = false }: { stats: { fitness: number; defensive: number; strengths: number; intensity: number }, size?: number, showLabels?: boolean }) {
    const center = size / 2;
    const padding = showLabels ? 35 : 2;
    const maxVal = 5;
    const scale = (size / 2 - padding) / maxVal;

    const attributes = [
        { label: 'E. Físico', val: stats.fitness, angle: -Math.PI / 2 },
        { label: 'Defensa', val: stats.defensive, angle: 0 },
        { label: 'Fortaleza', val: stats.strengths, angle: Math.PI / 2 },
        { label: 'Intensidad', val: stats.intensity, angle: Math.PI },
    ];

    const points = attributes.map(attr => ({
        x: center + Math.cos(attr.angle) * (attr.val * scale),
        y: center + Math.sin(attr.angle) * (attr.val * scale)
    }));

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* Grid */}
            {[1, 2, 3, 4, 5].map(lvl => (
                <polygon
                    key={lvl}
                    points={attributes.map(attr => `${center + Math.cos(attr.angle) * (lvl * scale)},${center + Math.sin(attr.angle) * (lvl * scale)}`).join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                />
            ))}

            {/* Axis */}
            {attributes.map((attr, i) => (
                <line
                    key={i}
                    x1={center} y1={center}
                    x2={center + Math.cos(attr.angle) * (5 * scale)}
                    y2={center + Math.sin(attr.angle) * (5 * scale)}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                />
            ))}

            <polygon
                points={polygonPoints}
                fill="rgba(16, 185, 129, 0.2)"
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth={showLabels ? 2 : 1.5}
                strokeLinejoin="round"
            />

            {showLabels && attributes.map((attr, i) => {
                const labelX = center + Math.cos(attr.angle) * (5 * scale + 12);
                const labelY = center + Math.sin(attr.angle) * (5 * scale + 12);
                return (
                    <g key={i}>
                        <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className="text-[9px] fill-gray-500 font-bold uppercase"
                        >
                            {attr.label}
                        </text>
                        <circle
                            cx={center + Math.cos(attr.angle) * (attr.val * scale)}
                            cy={center + Math.sin(attr.angle) * (attr.val * scale)}
                            r="3"
                            fill="rgb(16, 185, 129)"
                        />
                        <text
                            x={center + Math.cos(attr.angle) * (attr.val * scale)}
                            y={center + Math.sin(attr.angle) * (attr.val * scale) - 8}
                            textAnchor="middle"
                            className="text-[10px] fill-white font-black"
                        >
                            {attr.val}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function RadarModal({ player, onClose }: { player: Player, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-6 shadow-2xl scale-110" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-emerald-400">{player.alias || player.player}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Perfil Técnico Detallado</p>
                </div>

                <div className="p-10 bg-black/20 rounded-full border border-white/5 relative">
                    <RadarChart
                        size={200}
                        showLabels={true}
                        stats={{
                            fitness: player.fitness,
                            defensive: player.defensive,
                            strengths: player.strengths,
                            intensity: player.intensity || 0
                        }}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-8 py-2 rounded-xl transition-all border border-emerald-500/20 font-bold text-sm"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
export default function PlayersPage() {
    const { user, logout } = useUser();
    const [selectedRadarPlayer, setSelectedRadarPlayer] = useState<Player | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Player | 'age'; direction: 'asc' | 'desc' }>({
        key: 'status',
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
                    mobil: newPlayerData.mobil || '',
                    pos: '',
                    fitness: 5,
                    defensive: 5,
                    strengths: 5,
                    intensity: 5,
                    status: 'A'
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
            p.player.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let valA: any = sortConfig.key === 'age' ? calculateAgeNum(a.birth) : a[sortConfig.key as keyof Player];
            let valB: any = sortConfig.key === 'age' ? calculateAgeNum(b.birth) : b[sortConfig.key as keyof Player];

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
                <div className="flex items-center gap-2 sm:gap-4">
                    {user && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 hidden md:flex">
                            {user.role === 'Admin' ? <Shield className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-emerald-400" />}
                            <span className="text-xs font-bold text-gray-300">{user.username} <span className="text-gray-500 font-normal">({user.role})</span></span>
                        </div>
                    )}
                    
                    <button
                        onClick={() => logout()}
                        className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>

                    {(user?.role === 'Admin' || user?.role === 'Entrenador') && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Nuevo Jugador</span>
                        </button>
                    )}
                </div>
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
                            <th className="px-6 py-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('pos')}>
                                <div className="flex items-center gap-1">
                                    Posiciones {sortConfig.key === 'pos' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('fitness')}>
                                <div className="flex items-center justify-center gap-1">
                                    EF {sortConfig.key === 'fitness' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('defensive')}>
                                <div className="flex items-center justify-center gap-1">
                                    CD {sortConfig.key === 'defensive' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('strengths')}>
                                <div className="flex items-center justify-center gap-1">
                                    F {sortConfig.key === 'strengths' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('intensity')}>
                                <div className="flex items-center justify-center gap-1">
                                    INT {sortConfig.key === 'intensity' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    NG {sortConfig.key === 'ng' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-center">Perfil</th>
                            <th className="px-6 py-4 font-semibold text-center cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    Est. {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                        <span>Cargando jugadores...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-500 italic">
                                    No se encontraron jugadores.
                                </td>
                            </tr>
                        ) : filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                <td
                                    className={`px-6 py-4 font-medium transition-colors ${user?.role !== 'Jugador' ? 'text-emerald-400 cursor-pointer hover:underline decoration-emerald-500/30' : 'text-gray-300'}`}
                                    onClick={() => user?.role !== 'Jugador' && setEditingPlayer(player)}
                                    title={user?.role !== 'Jugador' ? 'Haga clic para editar' : ''}
                                >
                                    {player.alias || player.player}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-400">{calculateAgeNum(player.birth) || '-'}</td>
                                <td className="px-6 py-4 text-gray-400 text-sm">{player.pos || '-'}</td>
                                <td className="px-6 py-4 text-center text-blue-400">{Math.round(player.fitness)}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{Math.round(player.defensive)}</td>
                                <td className="px-6 py-4 text-center text-orange-400">{Math.round(player.strengths)}</td>
                                <td className="px-6 py-4 text-center text-purple-400">{Math.round(player.intensity || 0)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                                        {player.ng ? Number(player.ng).toFixed(1) : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div
                                        className="flex justify-center cursor-pointer hover:scale-125 transition-transform"
                                        onClick={() => setSelectedRadarPlayer(player)}
                                        title="Ver perfil detallado"
                                    >
                                        <RadarChart stats={{
                                            fitness: player.fitness,
                                            defensive: player.defensive,
                                            strengths: player.strengths,
                                            intensity: player.intensity || 0
                                        }} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block w-8 py-1 rounded-md text-sm font-bold ${player.status === 'A' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {player.status}
                                    </span>
                                </td>
                                {/* Cell for spacing if needed, or just remove if entire column header is gone */}
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

            {selectedRadarPlayer && (
                <RadarModal
                    player={selectedRadarPlayer}
                    onClose={() => setSelectedRadarPlayer(null)}
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
    const [mobil, setCelular] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [mail, setMail] = useState('');
    const [u_id, setDni] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isDniValid = u_id.length >= 7 && !isNaN(Number(u_id));
    const isEmailValid = emailRegex.test(mail);
    const isNameValid = nombre.trim().length >= 3;

    const isFormValid = isNameValid && isEmailValid && isDniValid;

    const handleSubmit = () => {
        if (!isFormValid) return;
        onSave({ player: nombre, mobil, birth: fechaNacimiento, mail, u_id });
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
                            <label className="block text-xs text-gray-400 mb-1 ml-1 flex justify-between">
                                Nombre Completo <span className="text-red-500">*</span>
                                {nombre && !isNameValid && <span className="text-[10px] text-red-400">Mín. 3 caracteres</span>}
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className={`w-full bg-white/5 border rounded-xl p-3 outline-none focus:ring-2 transition-all text-white ${nombre && !isNameValid ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-emerald-500'}`}
                                placeholder="Ej: Juan Pérez"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Celular</label>
                            <input
                                type="text"
                                value={mobil}
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
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1 flex justify-between">
                                Email <span className="text-red-500">*</span>
                                {mail && !isEmailValid && <span className="text-[10px] text-red-400">Formato inválido</span>}
                            </label>
                            <input
                                type="email"
                                value={mail}
                                onChange={e => setMail(e.target.value)}
                                className={`w-full bg-white/5 border rounded-xl p-3 outline-none focus:ring-2 transition-all text-white ${mail && !isEmailValid ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-emerald-500'}`}
                                placeholder="ejemplo@mail.com"
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1 flex justify-between">
                                DNI <span className="text-red-500">*</span>
                                {u_id && !isDniValid && <span className="text-[10px] text-red-400">Mín. 7 números</span>}
                            </label>
                            <input
                                type="text"
                                value={u_id}
                                onChange={e => setDni(e.target.value)}
                                className={`w-full bg-white/5 border rounded-xl p-3 outline-none focus:ring-2 transition-all text-white ${u_id && !isDniValid ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-emerald-500'}`}
                                placeholder="12345678"
                                required
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
                        disabled={saving || !isFormValid}
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
    const { user } = useUser();
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
        let finalValue = value;

        // Clamp numerical technical stats to 0-5
        if (['fitness', 'defensive', 'strengths', 'intensity'].includes(field as string)) {
            finalValue = Math.max(0, Math.min(5, Number(value)));
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }));
    };

    const handleTogglePosition = (sigla: string) => {
        const currentPositions = formData.p_name ? formData.p_name.split(',').map(s => s.trim()).filter(Boolean) : [];
        let newPositions;
        if (currentPositions.includes(sigla)) {
            newPositions = currentPositions.filter(s => s !== sigla);
        } else {
            newPositions = [...currentPositions, sigla];
        }
        handleChange('p_name', newPositions.join(','));
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const handleIndividualRecalculate = async () => {
        try {
            const res = await fetch('/api/players/calculate-ng', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fitness: formData.fitness,
                    defensive: formData.defensive,
                    strengths: formData.strengths,
                    intensity: formData.intensity,
                    birth: formData.birth ? formData.birth.split('T')[0] : ''
                })
            });
            const data = await res.json();
            if (data.ng !== undefined) {
                setFormData(prev => ({ ...prev, ng: data.ng }));
            }
        } catch (error) {
            console.error('Error recalculating NG:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-xl rounded-3xl overflow-hidden border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold">Editar: <span className="text-emerald-400">{player.alias || player.player}</span></h2>
                        <button
                            onClick={() => handleChange('status', formData.status === 'A' ? 'I' : 'A')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'A' ? 'bg-emerald-600' : 'bg-red-900/40'}`}
                        >
                            <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.status === 'A' ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.player}
                                onChange={e => handleChange('player', e.target.value)}
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
                            {user?.role === 'Admin' ? (
                                <input
                                    type="text"
                                    value={formData.mobil}
                                    onChange={e => handleChange('mobil', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white font-mono"
                                />
                            ) : (
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-gray-500 italic pointer-events-none select-none">
                                    [ Data Protection ]
                                </div>
                            )}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.birth ? formData.birth.split('T')[0] : ''}
                                onChange={e => handleChange('birth', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Email</label>
                            <input
                                type="email"
                                value={formData.mail || ''}
                                onChange={e => handleChange('mail', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="ejemplo@mail.com"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Documento (DNI)</label>
                            {user?.role === 'Admin' ? (
                                <input
                                    type="text"
                                    value={formData.u_id || ''}
                                    onChange={e => handleChange('u_id', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white font-mono"
                                />
                            ) : (
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-gray-500 italic pointer-events-none select-none">
                                    [ Data Protection ]
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">ID Equipo</label>
                            <input
                                type="number"
                                value={formData.t_id || ''}
                                onChange={e => handleChange('t_id', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Casaca</label>
                            <input
                                type="text"
                                value={formData.pos || ''}
                                onChange={e => handleChange('pos', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                                placeholder="10"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 ml-1">Edad</label>
                            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center">
                                {calculateAge(formData.birth)}
                            </div>
                        </div>
                    </div>



                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-2 ml-1">Posiciones</label>
                        <div className="grid grid-cols-6 gap-2 p-2 bg-white/5 rounded-2xl border border-white/5">
                            {POSITIONS.map(pos => (
                                <label key={pos.sigla} className="flex flex-col items-center gap-1 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={(formData.p_name || '').split(',').map(s => s.trim()).includes(pos.sigla)}
                                        onChange={() => handleTogglePosition(pos.sigla)}
                                        className="w-4 h-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-[10px] font-bold group-hover:text-emerald-400 transition-colors">{pos.sigla}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">E. Físico</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="1"
                                value={Math.round(formData.fitness)}
                                onChange={e => handleChange('fitness', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">Defensa</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="1"
                                value={Math.round(formData.defensive)}
                                onChange={e => handleChange('defensive', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">Fortaleza</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="1"
                                value={Math.round(formData.strengths)}
                                onChange={e => handleChange('strengths', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1 ml-1">Intensidad</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="1"
                                value={Math.round(formData.intensity || 0)}
                                onChange={e => handleChange('intensity', Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-emerald-400 text-left">Nivel General (NG)</span>
                            <span className="text-xs text-gray-500 italic text-left">Calculado según atributos y edad</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleIndividualRecalculate}
                                className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors text-emerald-400 group"
                                title="Recalcular según configuración actual"
                            >
                                <RefreshCcw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                            </button>
                            <div className="text-2xl font-black text-emerald-400">
                                {formData.ng ? Number(formData.ng).toFixed(1) : '-'}
                            </div>
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
