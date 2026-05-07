'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    User, 
    Mail, 
    Fingerprint, 
    Calendar, 
    Users, 
    Shield, 
    Zap, 
    Dumbbell, 
    Target,
    CheckCircle2,
    Loader2,
    ChevronRight,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';

const POSITIONS = [
    { sigla: 'GK', label: 'Arquero' },
    { sigla: 'DF', label: 'Defensor' },
    { sigla: 'LI', label: 'Lat. Izquierdo' },
    { sigla: 'LD', label: 'Lat. Derecho' },
    { sigla: 'MC', label: 'Mediocampista' },
    { sigla: 'MI', label: 'Vol. Izquierdo' },
    { sigla: 'MD', label: 'Vol. Derecho' },
    { sigla: 'MP', label: 'Mediapunta' },
    { sigla: 'ST', label: 'Delantero' },
];

function JoinForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        player: '',
        alias: '',
        birth: '',
        mail: '',
        u_id: '',
        team_ids: [] as number[],
        p_name: [] as string[],
        fitness: 3,
        defensive: 3,
        strengths: 3,
        intensity: 3,
    });

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setIsValid(false);
            setError('Se requiere un link de invitación válido.');
            return;
        }

        const validateToken = async () => {
            try {
                const res = await fetch(`/api/invitations?token=${token}`);
                const data = await res.json();
                if (data.valid) {
                    setIsValid(true);
                    if (data.team_ids) {
                        setFormData(prev => ({ ...prev, team_ids: data.team_ids }));
                    }
                } else {
                    setError(data.error || 'El link ha expirado o es inválido.');
                }
            } catch (err) {
                setError('Error al validar la invitación.');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const togglePosition = (sigla: string) => {
        setFormData(prev => {
            const current = prev.p_name;
            if (current.includes(sigla)) {
                return { ...prev, p_name: current.filter(s => s !== sigla) };
            } else {
                return { ...prev, p_name: [...current, sigla] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    token, 
                    p_name: formData.p_name.join(','),
                }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Error al registrarte');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = formData.player && formData.mail && formData.u_id && formData.birth;
    const isStep2Valid = formData.p_name.length > 0;

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    <p className="text-gray-400 font-medium animate-pulse">Validando invitación...</p>
                </div>
            </div>
        );
    }

    if (!isValid && !success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass max-w-md w-full p-8 rounded-3xl text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10 text-rose-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Link Inválido</h1>
                        <p className="text-gray-400">{error}</p>
                    </div>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">¡Bienvenido!</h1>
                        <p className="text-gray-400">Tu perfil ha sido creado correctamente. Tu invitación ha sido procesada.</p>
                    </div>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Ir al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black gradient-text tracking-tight">ÚNETE A FURBOL AI</h1>
                    <p className="text-gray-500 font-medium">Completa tu perfil de jugador para empezar</p>
                </div>

                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
                    <div className="p-8 space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-400" /> Datos Personales
                                    </h2>
                                    
                                    <div className="grid gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Juan Pérez"
                                                    value={formData.player}
                                                    onChange={e => handleChange('player', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sobrenombre / Alias</label>
                                            <input 
                                                type="text" 
                                                placeholder="Juancho"
                                                value={formData.alias}
                                                onChange={e => handleChange('alias', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">DNI / Documento</label>
                                                <div className="relative">
                                                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="12345678"
                                                        value={formData.u_id}
                                                        onChange={e => handleChange('u_id', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fec. Nacimiento</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                                    <input 
                                                        type="date" 
                                                        value={formData.birth}
                                                        onChange={e => handleChange('birth', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                                                        style={{ colorScheme: 'dark' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input 
                                                    type="email" 
                                                    placeholder="ejemplo@mail.com"
                                                    value={formData.mail}
                                                    onChange={e => handleChange('mail', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                                                />
                                            </div>
                                        </div>

                                        {formData.team_ids.length > 0 && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Equipos Asignados</label>
                                                <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-2xl border border-white/5">
                                                    {formData.team_ids.map(id => (
                                                        <span key={id} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                                                            Equipo ID: {id}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Siguiente Paso <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-emerald-400" /> Posiciones
                                    </h2>
                                    <p className="text-sm text-gray-500">Elige al menos una posición donde juegas habitualmente.</p>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {POSITIONS.map(pos => (
                                            <button
                                                key={pos.sigla}
                                                onClick={() => togglePosition(pos.sigla)}
                                                className={`p-4 rounded-2xl border text-left transition-all group ${
                                                    formData.p_name.includes(pos.sigla)
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-lg font-black group-hover:scale-110 transition-transform">{pos.sigla}</div>
                                                <div className="text-[10px] uppercase font-bold opacity-60">{pos.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="w-5 h-5" /> Volver
                                    </button>
                                    <button 
                                        onClick={() => setStep(3)}
                                        disabled={!isStep2Valid}
                                        className="flex-[2] py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Siguiente Paso <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-emerald-400" /> Perfil Técnico
                                    </h2>
                                    <p className="text-sm text-gray-500">Evalúate del 1 al 5 en cada categoría.</p>
                                    
                                    <div className="space-y-8">
                                        {[
                                            { id: 'fitness', label: 'Estado Físico', icon: Dumbbell },
                                            { id: 'defensive', label: 'Defensa', icon: Shield },
                                            { id: 'strengths', label: 'Fortaleza', icon: Zap },
                                            { id: 'intensity', label: 'Intensidad', icon: Target },
                                        ].map(stat => (
                                            <div key={stat.id} className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                                                        <stat.icon className="w-4 h-4 text-emerald-500" />
                                                        {stat.label}
                                                    </div>
                                                    <span className="text-2xl font-black text-emerald-400">{(formData as any)[stat.id]}</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="5" 
                                                    step="1"
                                                    value={(formData as any)[stat.id]}
                                                    onChange={e => handleChange(stat.id, parseInt(e.target.value))}
                                                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                                                    <span>BÁSICO</span>
                                                    <span>PRO</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="w-5 h-5" /> Volver
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Completar Registro'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        }>
            <JoinForm />
        </Suspense>
    );
}
