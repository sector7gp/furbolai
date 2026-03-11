'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChangePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (!passRegex.test(newPassword)) {
            return setError('Debe tener min. 6 caracteres, 1 mayúscula, 1 minúscula y 1 número');
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            if (res.ok) {
                router.push('/');
            } else {
                const data = await res.json();
                setError(data.error || 'Error al actualizar contraseña');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                            <KeyRound className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Actualizá tu Clave</h1>
                        <p className="text-gray-500 text-sm text-center mt-2 px-4 italic">
                            Por seguridad, debés cambiar tu contraseña predeterminada en el primer acceso.
                        </p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 ml-1 uppercase font-bold tracking-wider">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-2 ml-1 uppercase font-bold tracking-wider">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                                placeholder="Repetí la contraseña"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Requerimientos:</p>
                            <ul className="space-y-1">
                                <li className={`flex items-center gap-2 text-xs ${newPassword.length >= 6 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> Mínimo 6 caracteres
                                </li>
                                <li className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(newPassword) ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> Una mayúscula
                                </li>
                                <li className={`flex items-center gap-2 text-xs ${/[a-z]/.test(newPassword) ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> Una minúscula
                                </li>
                                <li className={`flex items-center gap-2 text-xs ${/\d/.test(newPassword) ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> Un número
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !passRegex.test(newPassword) || newPassword !== confirmPassword}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale py-4 rounded-2xl text-white font-black text-lg transition-all shadow-xl shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'CONFIRMAR CAMBIO'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
