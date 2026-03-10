import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM jugadores WHERE status != 'D' ORDER BY alias ASC");
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, status, fecha_alta, fecha_baja, fecha_modificacion } = body;

        // Format date to YYYY-MM-DD if it exists
        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        const [result] = await pool.query(
            `INSERT INTO jugadores (player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, t_id || null, u_id || null, fitness || 5, defensive || 5, strengths || 5, status || 'A']
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
        const { id, player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Format date to YYYY-MM-DD if it exists
        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        await pool.query(
            `UPDATE jugadores 
             SET player = ?, mobil = ?, alias = ?, birth = ?, pos = ?, 
                 p_name = ?, mail = ?, t_id = ?, u_id = ?, fitness = ?, defensive = ?, strengths = ?, status = ?
             WHERE id = ?`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, t_id || null, u_id || null, fitness, defensive, strengths, status, id]
        );

        return NextResponse.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
