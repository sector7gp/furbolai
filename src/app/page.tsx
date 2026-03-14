'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ClipboardList, Settings, LogOut, User, Shield, History as HistoryIcon } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import HistoryModal from '@/components/HistoryModal';

export default function Home() {
    const { user, logout } = useUser();
    const [historyOpen, setHistoryOpen] = useState(false);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}
            <header className="flex flex-col items-center mb-16 relative">
                {user && (
                    <div className="absolute top-0 right-0 flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 hidden sm:flex">
                            {user.role === 'Admin' ? <Shield className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-emerald-400" />}
                            <span className="text-xs font-bold text-gray-300">{user.displayName}</span>
                        </div>
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
                {user?.role !== 'Jugador' && (
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
