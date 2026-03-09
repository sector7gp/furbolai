import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM jugadores WHERE fecha_baja IS NULL ORDER BY alias ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad, estado } = body;

        const [result] = await pool.query(
            `INSERT INTO jugadores (jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad, estado || 'A']
        );

        return NextResponse.json({ id: (result as any).insertId, ...body });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad, estado } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await pool.query(
            `UPDATE jugadores 
             SET jugador = ?, celular = ?, alias = ?, fecha_nacimiento = ?, posiciones = ?, 
                 ng = ?, ef = ?, co = ?, cd = ?, intensidad = ?, estado = ?
             WHERE id = ?`,
            [jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad, estado, id]
        );

        return NextResponse.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
