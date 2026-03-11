import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePasswords, createSession, hashPassword } from '@/lib/auth-util';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
        }

        // Buscar usuario
        const [users]: any = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        let user = users[0];

        // Si el usuario no existe, checkeamos si existe en la tabla jugadores por DNI para "auto-crear" el perfil Admin o inicial
        if (!user) {
            const [players]: any = await pool.query('SELECT * FROM jugadores WHERE u_id = ?', [username]);
            if (players.length > 0) {
                // Si el DNI/Username coincide con el password, permitimos el primer login
                if (username === password) {
                    const hashedPassword = await hashPassword(password);
                    // El primer usuario que se loguea via DNI lo podemos hacer Admin si queremos, 
                    // o simplemente 'Jugador' por defecto. El usuario pidió perfiles.
                    // Para simplificar esta etapa, si es el primer login, creamos el registro en `usuarios`.
                    await pool.query(
                        'INSERT INTO usuarios (username, password, role, must_change_password, player_id) VALUES (?, ?, ?, ?, ?)',
                        [username, hashedPassword, 'Jugador', true, players[0].id]
                    );
                    const [newUsers]: any = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
                    user = newUsers[0];
                } else {
                    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
                }
            } else {
                // Caso especial: Primer Admin manual o check
                return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
            }
        } else {
            // Verificar password
            let isValid = await comparePasswords(password, user.password);
            
            // Fallback para contraseñas en texto plano (casos de inserción manual)
            if (!isValid && password === user.password) {
                isValid = true;
            }

            if (!isValid) {
                return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
            }
        }

        // Obtener nombre/alias del jugador para el display
        const [userData]: any = await pool.query(
            'SELECT j.alias, j.player FROM usuarios u JOIN jugadores j ON u.player_id = j.id WHERE u.id = ?',
            [user.id]
        );
        const displayName = userData[0]?.alias || userData[0]?.player || user.username;

        // Crear sesión
        const token = await createSession({
            userId: user.id,
            username: user.username,
            role: user.role,
            mustChangePassword: user.must_change_password,
            displayName
        });

        const response = NextResponse.json({ 
            success: true, 
            mustChangePassword: user.must_change_password,
            role: user.role,
            displayName
        });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
