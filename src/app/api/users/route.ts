import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth-util';
import { cookies } from 'next/headers';

async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return false;
    const session = await verifySession(token);
    return session && session.role === 'Admin';
}

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const [users]: any = await pool.query(`
            SELECT u.id, u.username, u.role, u.player_id, j.player as display_name
            FROM usuarios u
            LEFT JOIN jugadores j ON u.player_id = j.id
            ORDER BY u.role ASC, u.username ASC
        `);

        // Fetch team assignments for each user
        const [assignments]: any = await pool.query('SELECT usuario_id, equipo_id FROM usuario_equipos');

        const usersWithTeams = users.map((user: any) => ({
            ...user,
            team_ids: assignments
                .filter((a: any) => a.usuario_id === user.id)
                .map((a: any) => a.equipo_id)
        }));

        return NextResponse.json(usersWithTeams);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const { id, role, team_ids } = await request.json();
        
        if (!id || !role) {
            return NextResponse.json({ error: 'ID y Role son requeridos' }, { status: 400 });
        }

        // Update role
        await pool.query('UPDATE usuarios SET role = ? WHERE id = ?', [role, id]);

        // Update team assignments (usuario_equipos)
        if (Array.isArray(team_ids)) {
            // Transaction-like approach (manual delete/insert)
            await pool.query('DELETE FROM usuario_equipos WHERE usuario_id = ?', [id]);
            
            if (team_ids.length > 0) {
                const values = team_ids.map(tId => [id, tId]);
                await pool.query('INSERT INTO usuario_equipos (usuario_id, equipo_id) VALUES ?', [values]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
