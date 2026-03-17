import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-util';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const session = await verifySession(sessionToken);
        
        if (!session) {
            console.log('[AUTH/ME] Session verification failed');
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        // Alway fetch latest data to keep UI in sync (name edits, role changes, etc)
        const [userData]: any = await pool.query(
            'SELECT u.id, u.username, u.role, u.player_id, j.alias, j.player FROM usuarios u LEFT JOIN jugadores j ON u.player_id = j.id WHERE u.id = ? OR u.username = ?',
            [session.userId || (session as any).id, session.username]
        );

        if (userData.length > 0) {
            const dbUser = userData[0];
            const updatedSession = {
                ...session,
                userId: dbUser.id,
                username: dbUser.username,
                role: dbUser.role,
                playerId: dbUser.player_id,
                displayName: dbUser.alias || dbUser.player || dbUser.username
            };
            console.log('[AUTH/ME] User found in DB, returning updated session:', updatedSession.displayName);
            return NextResponse.json({ user: updatedSession });
        }

        console.log('[AUTH/ME] User not found in DB for session:', session.userId);
        return NextResponse.json({ user: session });
    } catch (error) {
        console.error('[AUTH/ME] Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
