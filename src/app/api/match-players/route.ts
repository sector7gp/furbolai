import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { names } = await request.json();
        if (!Array.isArray(names) || names.length === 0) {
            return NextResponse.json({ players: [] });
        }

        // Search for players whose alias or jugador matches any of the names
        // Using a simple query for now. This could be optimized.
        const [rows]: any = await pool.query(
            `SELECT id, player, mobil, alias, birth, pos, fitness, defensive, strengths, status
             FROM jugadores WHERE (player IN (?) OR alias IN (?)) AND status = 'A'`,
            [names, names]
        );

        // Map found players to original requested names to handle missing ones
        const foundNames = new Set(rows.map((p: any) => p.player.toLowerCase()).concat(rows.map((p: any) => p.alias?.toLowerCase())));

        const missing = names.filter(n => !foundNames.has(n.toLowerCase()));

        return NextResponse.json({
            players: rows,
            missing: missing
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
