import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM sorteos ORDER BY fecha_creacion DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { teams } = await request.json();
        const teamsJson = JSON.stringify(teams);

        const [result]: any = await pool.query(
            'INSERT INTO sorteos (equipos_json) VALUES (?)',
            [teamsJson]
        );

        return NextResponse.json({ id: result.insertId, teams });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, goles_eq1, goles_eq2 } = await request.json();

        await pool.query(
            'UPDATE sorteos SET goles_eq1 = ?, goles_eq2 = ? WHERE id = ?',
            [goles_eq1, goles_eq2, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
