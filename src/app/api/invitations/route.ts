import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth-util';
import { cookies } from 'next/headers';
import crypto from 'crypto';

async function isAuthorized() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return false;
    const session = await verifySession(token);
    return session && (session.role === 'Admin' || session.role === 'Entrenador');
}

export async function POST(request: Request) {
    if (!await isAuthorized()) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { t_id } = body;
        
        const token = crypto.randomBytes(32).toString('hex');
        
        // Expiration in 24 hours
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        const formattedExpires = expires.toISOString().slice(0, 19).replace('T', ' ');

        await pool.query(
            'INSERT INTO invitaciones (token, t_id, fecha_expiracion) VALUES (?, ?, ?)',
            [token, t_id || null, formattedExpires]
        );

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error generating invitation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ valid: false, error: 'Token requerido' }, { status: 400 });
    }

    try {
        const [rows]: any = await pool.query(
            'SELECT t_id FROM invitaciones WHERE token = ? AND usado = FALSE AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())',
            [token]
        );

        if (rows.length === 0) {
            return NextResponse.json({ valid: false, error: 'Invitación inválida o expirada' });
        }

        return NextResponse.json({ valid: true, t_id: rows[0].t_id });
    } catch (error) {
        console.error('Error validating token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
