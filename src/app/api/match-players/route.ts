import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { names } = await request.json();
        if (!Array.isArray(names) || names.length === 0) {
            return NextResponse.json({ players: [] });
        }

        // Search for players whose alias or jugador matches any of the names
        // Normalize names for comparison
        const cleanNames = names.map(n => n.trim().toLowerCase());
        
        const [rows]: any = await pool.query(
            `SELECT id, player AS jugador, alias, ng, fitness, defensive, strengths, intensity, status
             FROM jugadores 
             WHERE (LOWER(player) IN (?) OR LOWER(alias) IN (?)) 
             AND status = 'A'`,
            [cleanNames, cleanNames]
        );

        // Map found players to original requested names to handle missing ones
        const foundNames = new Set();
        rows.forEach((p: any) => {
            foundNames.add(p.jugador.toLowerCase());
            if (p.alias) foundNames.add(p.alias.toLowerCase());
        });

        const missing = names.filter(n => !foundNames.has(n.trim().toLowerCase()));

        return NextResponse.json({
            players: rows,
            missing: missing
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
