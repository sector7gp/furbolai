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
    
    const totalWeight = Number(w_fitness) + Number(w_defensive) + Number(w_strengths) + Number(w_intensity);
    const weightedSum = (Number(fitness) * Number(w_fitness)) + 
                        (Number(defensive) * Number(w_defensive)) + 
                        (Number(strengths) * Number(w_strengths)) + 
                        (Number(intensity) * Number(w_intensity));
    
    const technicalAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
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
    
    return Math.min(10, Math.max(1, Number((technicalAverage * ageFactor).toFixed(1))));
}

async function getNGConfig(): Promise<NGConfig> {
    const [rows]: any = await pool.query('SELECT w_fitness, w_defensive, w_strengths, w_intensity, age_min, age_max, age_decay FROM configuracion WHERE id = 1');
    if (rows.length > 0) return rows[0];
    return { w_fitness: 1, w_defensive: 1, w_strengths: 1, w_intensity: 1, age_min: 20, age_max: 32, age_decay: 0.02 };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { player, alias, birth, p_name, mail, t_id, u_id, fitness, defensive, strengths, intensity } = body;

        // Validation
        if (!player || !mail || !u_id) {
            return NextResponse.json({ error: 'Faltan datos obligatorios (Nombre, Email, DNI)' }, { status: 400 });
        }

        const config = await getNGConfig();

        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        // Posiciones logic from existing app:
        // p_name: names like 'GK,LI'
        // pos: number of primary position (we can derive this or just leave it)
        // In the existing POST, 'pos' is passed but here we only have p_name.
        // Let's use the first position in p_name as 'pos' if available.
        const posMap: Record<string, string> = {
            'GK': '1', 'DF': '2', 'LI': '3', 'LD': '4', 'MC': '5', 'MI': '6', 'MD': '7', 'MP': '8', 'ST': '9'
        };
        const firstPos = p_name ? p_name.split(',')[0].trim() : '';
        const pos = posMap[firstPos] || '';

        const ng = calculateNG({ 
            fitness: fitness || 3, 
            defensive: defensive || 3, 
            strengths: strengths || 3, 
            intensity: intensity || 3, 
            birth: formattedDate || '' 
        }, config);

        const [result] = await pool.query(
            `INSERT INTO jugadores (player, alias, birth, pos, p_name, mail, t_id, u_id, fitness, defensive, strengths, intensity, ng, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                player, 
                alias || null, 
                formattedDate, 
                pos, 
                p_name || null, 
                mail, 
                t_id || null, 
                u_id, 
                fitness || 3, 
                defensive || 3, 
                strengths || 3, 
                intensity || 3, 
                ng, 
                'A'
            ]
        );

        return NextResponse.json({ 
            success: true,
            id: (result as any).insertId,
            ng
        });
    } catch (error) {
        console.error('Join Error:', error);
        return NextResponse.json({ error: 'Error al registrar el jugador' }, { status: 500 });
    }
}
