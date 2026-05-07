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
    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { player, alias, birth, p_name, mail, team_ids, u_id, fitness, defensive, strengths, intensity, token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token de invitación requerido' }, { status: 400 });
        }

        await connection.beginTransaction();

        // 1. Verify and Lock token
        const [invitations]: any = await connection.query(
            'SELECT id FROM invitaciones WHERE token = ? AND usado = FALSE AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW()) FOR UPDATE',
            [token]
        );

        if (invitations.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Invitación inválida, usada o expirada' }, { status: 403 });
        }

        // 2. Validation
        if (!player || !mail || !u_id) {
            await connection.rollback();
            return NextResponse.json({ error: 'Faltan datos obligatorios (Nombre, Email, DNI)' }, { status: 400 });
        }

        const config = await getNGConfig();

        // 3. Duplicate Alias Validation
        if (alias) {
            const [existing]: any = await connection.query('SELECT id FROM jugadores WHERE alias = ? AND status != "D"', [alias]);
            if (existing.length > 0) {
                await connection.rollback();
                return NextResponse.json({ error: `El sobrenombre "${alias}" ya está en uso.` }, { status: 400 });
            }
        }

        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

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

        // 3. Create Player
        const [result] = await connection.query(
            `INSERT INTO jugadores (player, alias, birth, pos, p_name, mail, u_id, fitness, defensive, strengths, intensity, ng, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                player, 
                alias || null, 
                formattedDate, 
                pos, 
                p_name || null, 
                mail, 
                u_id, 
                fitness || 3, 
                defensive || 3, 
                strengths || 3, 
                intensity || 3, 
                ng, 
                'A'
            ]
        );

        const newId = (result as any).insertId;

        // 4. Assign teams
        if (Array.isArray(team_ids) && team_ids.length > 0) {
            const values = team_ids.map(tId => [newId, tId]);
            await connection.query('INSERT INTO jugador_equipos (jugador_id, equipo_id) VALUES ?', [values]);
        }

        // 5. Consume Token
        await connection.query('UPDATE invitaciones SET usado = TRUE WHERE token = ?', [token]);

        await connection.commit();

        return NextResponse.json({ 
            success: true,
            id: newId,
            ng
        });
    } catch (error) {
        await connection.rollback();
        console.error('Join Error:', error);
        return NextResponse.json({ error: 'Error al registrar el jugador' }, { status: 500 });
    } finally {
        connection.release();
    }
}
