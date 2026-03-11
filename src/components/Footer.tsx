'use client';

import { useEffect, useState } from 'react';
import { Github, Cpu, Terminal } from 'lucide-react';

interface VersionInfo {
    version: string;
    buildDate: string;
}

export default function Footer() {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

    useEffect(() => {
        fetch('/version.json')
            .then(res => res.json())
            .then(data => setVersionInfo(data))
            .catch(() => null);
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-12 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="glass rounded-2xl p-6 border-white/5 bg-white/[0.02] shadow-xl">
                <div className="flex flex-col lg:grid lg:grid-cols-3 items-center gap-y-6 lg:gap-8">
                    {/* Copyright Section - Left in Desktop, Middle in Mobile */}
                    <div className="flex flex-col gap-2 text-center lg:text-left order-2 lg:order-1">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-gray-400 text-sm">
                            <span className="font-semibold text-gray-300">© {currentYear} FurbolAI</span>
                            <span className="hidden lg:inline text-gray-600">|</span>
                            <div className="flex items-center gap-1.5 group">
                                <Cpu className="w-3.5 h-3.5 text-emerald-500 group-hover:animate-pulse" />
                                <span className="text-xs tracking-tight">sector7gp.com, Antigravity & Gemini</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            Premium Management for Amateur Football
                        </p>
                    </div>

                    {/* Version Info - Center in Desktop, Top in Mobile */}
                    <div className="flex flex-col items-center justify-center gap-1 order-1 lg:order-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                            <Terminal className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-mono text-emerald-400">
                                {versionInfo?.version || 'v0.0.0'}
                            </span>
                        </div>
                        {versionInfo?.buildDate && (
                            <span className="text-[8px] text-gray-600 font-mono">
                                Last commit: {new Date(versionInfo.buildDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {/* Repo Link - Right in Desktop, Bottom in Mobile */}
                    <div className="flex items-center justify-center lg:justify-end order-3">
                        <a 
                            href="https://github.com/sector7gp/furbolai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-emerald-400 transition-all group border border-white/5"
                        >
                            <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-400 transition-colors">GitHub</span>
                            <div className="relative">
                                <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
