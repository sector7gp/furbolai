import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth-util';
import { cookies } from 'next/headers';

async function getAuthorizedTeams() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await verifySession(token);
    if (!session) return null;

    if (session.role === 'Admin') {
        const [rows]: any = await pool.query('SELECT * FROM equipos');
        return rows;
    }

    const [rows]: any = await pool.query(
        'SELECT e.* FROM equipos e JOIN usuario_equipos ue ON e.id = ue.equipo_id WHERE ue.usuario_id = ?',
        [session.userId]
    );
    return rows;
}

export async function GET() {
    try {
        const teams = await getAuthorizedTeams();
        if (!teams) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        return NextResponse.json(teams);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const session = await verifySession(token);
    if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    try {
        const { nombre, descripcion } = await request.json();
        if (!nombre) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });

        const [result]: any = await pool.query(
            'INSERT INTO equipos (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || '']
        );

        const newId = result.insertId;

        // Auto-assign permission to the creator (Admin)
        await pool.query(
            'INSERT INTO usuario_equipos (usuario_id, equipo_id) VALUES (?, ?)',
            [session.userId, newId]
        );

        return NextResponse.json({ id: newId, nombre, descripcion });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const session = await verifySession(token);
    if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });

        await pool.query('DELETE FROM equipos WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
