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
            <div className="glass rounded-2xl p-6 border-white/5 bg-white/[0.02]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Copyright Section */}
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
                            <span className="font-semibold text-gray-300">© {currentYear} FurbolAI</span>
                            <span className="text-gray-600">|</span>
                            <span className="flex items-center gap-1.5 group">
                                <Cpu className="w-3.5 h-3.5 text-emerald-500 group-hover:animate-pulse" />
                                <span className="text-xs tracking-tight">Pablo, Antigravity & Gemini</span>
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            Premium Management for Amateur Football
                        </p>
                    </div>

                    {/* Version & Repo Section */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Build Info */}
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
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

                        {/* Separator */}
                        <div className="h-8 w-px bg-white/5" />

                        {/* GitHub Icon */}
                        <a 
                            href="https://github.com/sector7gp/furbolai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-emerald-400 transition-all group relative"
                            title="View Repository"
                        >
                            <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
