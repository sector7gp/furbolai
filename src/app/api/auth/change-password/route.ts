import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, verifySession, createSession } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const session = await verifySession(sessionToken);
        if (!session) {
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        const { newPassword } = await req.json();

        // Validar seguridad de la password: 1 mayus, 1 minus, 1 numero, min 6 chars
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passRegex.test(newPassword)) {
            return NextResponse.json({ 
                error: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.' 
            }, { status: 400 });
        }

        const hashedPassword = await hashPassword(newPassword);

        await pool.query(
            'UPDATE usuarios SET password = ?, must_change_password = 0 WHERE id = ?',
            [hashedPassword, session.userId]
        );

        // Actualizar sesión para reflejar que ya no debe cambiar password
        const newToken = await createSession({
            ...session,
            mustChangePassword: false
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set('session', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return response;

    } catch (error: any) {
        console.error('CRITICAL: Change password error:', error);
        return NextResponse.json({ 
            error: 'Error interno de base de datos. Verifique la conexión.',
            details: error.message 
        }, { status: 500 });
    }
}
