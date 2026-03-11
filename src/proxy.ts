import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './lib/auth-util';

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Rutas públicas
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api/auth/login') ||
        pathname === '/login' ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    const sessionToken = req.cookies.get('session')?.value;

    if (!sessionToken) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const session = await verifySession(sessionToken);
    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si debe cambiar password y no está en la página de cambio (y no es un llamado a la API de auth)
    if (session.mustChangePassword && pathname !== '/change-password' && !pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/change-password', req.url));
    }

    // Protección por Rol (Ejemplo inicial para Entrenador/Admin)
    /*
    if (pathname.startsWith('/ajustes') && session.role === 'Jugador') {
        return NextResponse.redirect(new URL('/', req.url));
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)'],
};
