import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM jugadores WHERE fecha_baja IS NULL');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad } = body;

        const [result] = await pool.query(
            `INSERT INTO jugadores (jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad]
        );

        return NextResponse.json({ id: (result as any).insertId, ...body });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
