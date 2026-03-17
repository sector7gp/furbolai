'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ClipboardList, Settings, LogOut, User, Shield, History as HistoryIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import HistoryModal from '@/components/HistoryModal';
import ProfileModal from '@/components/ProfileModal';

export default function Home() {
    const { user, loading, logout } = useUser();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500/50" />
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}
            {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
            <header className="flex flex-col items-center mb-16 relative">
                {loading ? (
                    <div className="absolute top-0 right-0 p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                    </div>
                ) : user && (
                    <div className="absolute top-0 right-0 flex items-center gap-3">
                        <button 
                            onClick={() => setProfileOpen(true)}
                            className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                        >
                            {user.role === 'Admin' ? <Shield className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-emerald-400" />}
                            <span className="text-xs font-bold text-gray-300 group-hover:text-emerald-400">
                                {user.displayName} <span className="text-gray-500 font-normal group-hover:text-emerald-500/50 hidden xs:inline">({user.role})</span>
                            </span>
                        </button>
                        <button
                            onClick={() => logout()}
                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}
                
                <h1 className="text-6xl font-extrabold mb-4">
                    <span className="gradient-text">Pan Ai Queso</span>
                </h1>
                <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                    Armá tus equipos de fútbol de forma inteligente, equilibrada y rápida.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch">
                <Link href="/weekly" className="flex">
                    <Card
                        icon={<ClipboardList className="w-8 h-8 text-emerald-500" />}
                        title="Fútbol Semanal"
                        description="Pegá la lista de WhatsApp y generá los equipos al instante."
                    />
                </Link>
                <Link href="/players" className="flex">
                    <Card
                        icon={<Users className="w-8 h-8 text-blue-500" />}
                        title="Jugadores"
                        description="Gestioná la base de datos maestra con niveles y estadísticas."
                    />
                </Link>
                <Link href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); setHistoryOpen(true); }} className="flex">
                    <Card
                        icon={<HistoryIcon className="w-8 h-8 text-amber-500" />}
                        title="Sorteos Pasados"
                        description="Consultá el historial de equipos y resultados anteriores."
                    />
                </Link>
                {!loading && user && user.role !== 'Jugador' && (
                    <Link href="/settings" className="flex">
                        <Card
                            icon={<Settings className="w-8 h-8 text-purple-500" />}
                            title="Configuración"
                            description="Ajustá los algoritmos de equilibrio y preferencias."
                        />
                    </Link>
                )}
            </div>
        </main>
    );
}

function Card({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="glass p-8 rounded-2xl hover:bg-white/10 transition-colors group border-white/5 bg-white/[0.02] flex flex-col w-full h-full">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-gray-400 leading-relaxed flex-grow">{description}</p>
        </div>
    );
}
