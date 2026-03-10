import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface NGConfig {
    w_fitness: number;
    w_defensive: number;
    w_strengths: number;
    w_intensity: number;
    age_min: number;
    age_max: number;
    age_decay: number;
}

function calculateNG(stats: { fitness: number; defensive: number; strengths: number; intensity: number; birth: string }, config: NGConfig) {
    const { fitness, defensive, strengths, intensity, birth } = stats;
    const { w_fitness, w_defensive, w_strengths, w_intensity, age_min, age_max, age_decay } = config;
    
    // 1. Weighted average of technical stats
    const totalWeight = Number(w_fitness) + Number(w_defensive) + Number(w_strengths) + Number(w_intensity);
    const weightedSum = (Number(fitness) * Number(w_fitness)) + 
                        (Number(defensive) * Number(w_defensive)) + 
                        (Number(strengths) * Number(w_strengths)) + 
                        (Number(intensity) * Number(w_intensity));
    
    const technicalAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // 2. Age Factor (FE)
    let ageFactor = 1.0;
    if (birth) {
        const today = new Date();
        const birthDate = new Date(birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        
        if (age < age_min) {
            ageFactor = 0.9 + (age / age_min * 0.1);
        } else if (age > age_max) {
            ageFactor = Math.max(0.7, 1.0 - (age - age_max) * age_decay);
        }
    }
    
    // 3. Final NG
    return Math.min(10, Math.max(1, Number((technicalAverage * ageFactor).toFixed(1))));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fitness, defensive, strengths, intensity, birth } = body;

        // Fetch current config
        const [configRows]: any = await pool.query('SELECT w_fitness, w_defensive, w_strengths, w_intensity, age_min, age_max, age_decay FROM configuracion WHERE id = 1');
        const config = configRows.length > 0 ? configRows[0] : { w_fitness: 1, w_defensive: 1, w_strengths: 1, w_intensity: 1, age_min: 20, age_max: 32, age_decay: 0.02 };

        const ng = calculateNG({ fitness, defensive, strengths, intensity, birth }, config);

        return NextResponse.json({ ng });
    } catch (error) {
        console.error('Calculate NG Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
