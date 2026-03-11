import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
    const sessionToken = req.cookies.get('session')?.value;
    if (!sessionToken) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = await verifySession(sessionToken);
    if (!session) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    return NextResponse.json({ user: session });
}
