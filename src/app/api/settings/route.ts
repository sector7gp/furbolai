import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT * FROM configuracion WHERE id = 1');
        if (rows.length > 0) {
            const r = rows[0];
            return NextResponse.json({ 
                teamCount: r.team_count,
                t_id: r.t_id ?? null,
                w_fitness: r.w_fitness,
                w_defensive: r.w_defensive,
                w_strengths: r.w_strengths,
                w_intensity: r.w_intensity,
                age_min: r.age_min,
                age_max: r.age_max,
                age_decay: r.age_decay
            });
        }
        return NextResponse.json({ teamCount: 2, t_id: null, w_fitness: 1, w_defensive: 1, w_strengths: 1, w_intensity: 1, age_min: 20, age_max: 32, age_decay: 0.02 });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { teamCount, t_id, w_fitness, w_defensive, w_strengths, w_intensity, age_min, age_max, age_decay } = body;
        await pool.query(
            `UPDATE configuracion 
             SET team_count = ?, t_id = ?, w_fitness = ?, w_defensive = ?, w_strengths = ?, w_intensity = ?, 
                 age_min = ?, age_max = ?, age_decay = ? 
             WHERE id = 1`,
            [teamCount || 2, t_id ?? null, w_fitness ?? 1, w_defensive ?? 1, w_strengths ?? 1, w_intensity ?? 1, age_min ?? 20, age_max ?? 32, age_decay ?? 0.02]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
