import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT team_count FROM configuracion WHERE id = 1');
        if (rows.length > 0) {
            return NextResponse.json({ teamCount: rows[0].team_count });
        }
        return NextResponse.json({ teamCount: 2 });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { teamCount } = await request.json();
        await pool.query(
            'UPDATE configuracion SET team_count = ? WHERE id = 1',
            [teamCount || 2]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
