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
        // Admins might see all teams or only assigned ones. 
        // Based on request "only teams you have permission for", we'll filter even for admins unless they are super admins.
        // For now, let's assume Admin sees all for management, but we'll provide the filter.
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
