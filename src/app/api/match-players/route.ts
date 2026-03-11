import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { names } = await request.json();
        if (!Array.isArray(names) || names.length === 0) {
            return NextResponse.json({ players: [] });
        }

        // Match each name individually to ensure 1:1 mapping
        const finalPlayers = [];
        const missing = [];

        for (const name of names) {
            const cleanName = name.trim();
            if (!cleanName) continue;

            const [rows]: any = await pool.query(
                `SELECT id, player AS jugador, alias, ng, fitness, defensive, strengths, intensity, pos, p_name, status
                 FROM jugadores 
                 WHERE (LOWER(player) = ? OR LOWER(alias) = ?) 
                 AND status = 'A'
                 LIMIT 1`,
                [cleanName.toLowerCase(), cleanName.toLowerCase()]
            );

            if (rows.length > 0) {
                finalPlayers.push(rows[0]);
            } else {
                missing.push(cleanName);
            }
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
