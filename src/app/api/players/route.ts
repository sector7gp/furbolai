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
            // Gradual increase towards min_age
            ageFactor = 0.9 + (age / age_min * 0.1);
        } else if (age > age_max) {
            // Decay based on parameter
            ageFactor = Math.max(0.7, 1.0 - (age - age_max) * age_decay);
        }
    }
    
    // 3. Final NG
    return Math.min(10, Math.max(1, Number((technicalAverage * ageFactor).toFixed(1))));
}

async function getNGConfig(): Promise<NGConfig> {
    const [rows]: any = await pool.query('SELECT w_fitness, w_defensive, w_strengths, w_intensity, age_min, age_max, age_decay FROM configuracion WHERE id = 1');
    if (rows.length > 0) return rows[0];
    return { w_fitness: 1, w_defensive: 1, w_strengths: 1, w_intensity: 1, age_min: 20, age_max: 32, age_decay: 0.02 };
}

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM jugadores WHERE status != 'D' ORDER BY alias ASC");
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, intensity, status } = body;

        // Fetch current config
        const config = await getNGConfig();

        // Format date to YYYY-MM-DD if it exists
        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        const ng = calculateNG({ fitness: fitness || 5, defensive: defensive || 5, strengths: strengths || 5, intensity: intensity || 5, birth: formattedDate || '' }, config);
        const [result] = await pool.query(
            `INSERT INTO jugadores (player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, intensity, ng, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, t_id || null, u_id || null, fitness || 5, defensive || 5, strengths || 5, intensity || 5, ng, status || 'A']
        );

        const newId = (result as any).insertId;
        return NextResponse.json({ 
            id: newId, 
            jugador: player,
            alias,
            birth: formattedDate,
            pos,
            p_name,
            fitness: fitness || 5,
            defensive: defensive || 5,
            strengths: strengths || 5,
            intensity: intensity || 5,
            ng,
            status: status || 'A'
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, player, mobil, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, intensity, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Format date to YYYY-MM-DD if it exists
        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        // Fetch current config
        const config = await getNGConfig();

        const ng = calculateNG({ fitness: fitness || 5, defensive: defensive || 5, strengths: strengths || 5, intensity: intensity || 5, birth: formattedDate || '' }, config);

        await pool.query(
            `UPDATE jugadores 
             SET player = ?, mobil = ?, alias = ?, birth = ?, pos = ?, 
                 p_name = ?, mail = ?, t_id = ?, u_id = ?, fitness = ?, defensive = ?, strengths = ?, intensity = ?, ng = ?, status = ?
             WHERE id = ?`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, t_id || null, u_id || null, fitness, defensive, strengths, intensity, ng, status, id]
        );

        return NextResponse.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
