import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Normalize a string for fuzzy matching: lowercase, remove accents, collapse spaces
function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/[^a-z0-9\s]/g, '')     // keep only alphanumeric + spaces
        .replace(/\s+/g, ' ')
        .trim();
}

export async function POST(request: Request) {
    try {
        const { names, t_id } = await request.json();
        if (!Array.isArray(names) || names.length === 0) {
            return NextResponse.json({ players: [], missing: [] });
        }

        // Build t_id filter clause
        const teamFilter = t_id ? 'AND t_id = ?' : '';
        const teamParam = t_id ? [t_id] : [];

        // Fetch all active players for the team (or all if no t_id)
        const [allRows]: any = await pool.query(
            `SELECT id, player AS jugador, alias, ng, fitness, defensive, strengths, intensity, pos, p_name, status
             FROM jugadores
             WHERE status = 'A' ${teamFilter}`,
            [...teamParam]
        );

        // Pre-build a map of normalized name/alias → player row for fast lookup
        const playerMap = new Map<string, any>();
        for (const row of allRows) {
            const normPlayer = normalize(row.jugador || '');
            const normAlias  = normalize(row.alias || '');
            if (normPlayer) playerMap.set(normPlayer, row);
            if (normAlias && normAlias !== normPlayer) playerMap.set(normAlias, row);
        }

        const finalPlayers: any[] = [];
        const missing: string[] = [];
        const usedIds = new Set<number>(); // avoid duplicates

        for (const name of names) {
            const cleanName = name.trim();
            if (!cleanName) continue;

            const normName = normalize(cleanName);
            const match = playerMap.get(normName);

            if (match && !usedIds.has(match.id)) {
                finalPlayers.push(match);
                usedIds.add(match.id);
            } else if (!match) {
                missing.push(cleanName);
            }
            // If match exists but already used → treat as duplicate, skip silently
        }

        return NextResponse.json({
            players: finalPlayers,
            missing: missing
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
