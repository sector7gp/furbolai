import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession, SessionPayload } from '@/lib/auth-util';
import { cookies } from 'next/headers';

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

async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    return await verifySession(token);
}

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    try {
        let teamIds: number[] = [];
        
        if (session.role === 'Admin') {
            // Admins see everything
        } else {
            // Authorized teams via usuario_equipos (for managers/trainers)
            const [userTeams]: any = await pool.query('SELECT equipo_id FROM usuario_equipos WHERE usuario_id = ?', [session.userId]);
            teamIds = userTeams.map((t: any) => t.equipo_id);

            // If user is a player, also include teams they belong to
            if (session.role === 'Jugador' && session.playerId) {
                const [playerTeams]: any = await pool.query('SELECT equipo_id FROM jugador_equipos WHERE jugador_id = ?', [session.playerId]);
                const ptIds = playerTeams.map((t: any) => t.equipo_id);
                // Merge and unique
                teamIds = Array.from(new Set([...teamIds, ...ptIds]));
            }
        }

        if (teamIds.length === 0 && session.role !== 'Admin') {
            return NextResponse.json([]);
        }

        let query = `
            SELECT j.*, GROUP_CONCAT(je.equipo_id) as team_ids 
            FROM jugadores j
            LEFT JOIN jugador_equipos je ON j.id = je.jugador_id
            WHERE j.status != 'D'
        `;
        let params: any[] = [];

        if (session.role !== 'Admin') {
            query += ` AND EXISTS (SELECT 1 FROM jugador_equipos je2 WHERE je2.jugador_id = j.id AND je2.equipo_id IN (?))`;
            params.push(teamIds);
        }

        query += ` GROUP BY j.id ORDER BY j.alias ASC`;

        const [rows]: any = await pool.query(query, params);
        
        // Transform team_ids from string to array
        const formattedRows = rows.map((r: any) => ({
            ...r,
            team_ids: r.team_ids ? r.team_ids.split(',').map(Number) : []
        }));

        return NextResponse.json(formattedRows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'Admin' && session.role !== 'Entrenador')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { player, mobil, alias, birth, pos, p_name, mail, team_ids, u_id, fitness, defensive, strengths, intensity, status } = body;

        const config = await getNGConfig();

        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        const ng = calculateNG({ fitness: fitness || 5, defensive: defensive || 5, strengths: strengths || 5, intensity: intensity || 5, birth: formattedDate || '' }, config);
        
        // Verificar sobrenombre único
        if (alias) {
            const [existing]: any = await pool.query('SELECT id FROM jugadores WHERE alias = ? AND status != "D"', [alias]);
            if (existing.length > 0) {
                return NextResponse.json({ error: `El sobrenombre "${alias}" ya está en uso.` }, { status: 400 });
            }
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO jugadores (player, mobil, alias, birth, pos, p_name, mail, u_id, fitness, defensive, strengths, intensity, ng, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, u_id || null, fitness || 5, defensive || 5, strengths || 5, intensity || 5, ng, status || 'A']
        );

        const newId = (result as any).insertId;

        // Asignar equipos
        if (Array.isArray(team_ids) && team_ids.length > 0) {
            const values = team_ids.map(tId => [newId, tId]);
            await connection.query('INSERT INTO jugador_equipos (jugador_id, equipo_id) VALUES ?', [values]);
        }

        await connection.commit();

        return NextResponse.json({ 
            id: newId, 
            player,
            alias,
            birth: formattedDate,
            pos,
            p_name,
            fitness: fitness || 5,
            defensive: defensive || 5,
            strengths: strengths || 5,
            intensity: intensity || 5,
            ng,
            status: status || 'A',
            team_ids: team_ids || []
        });
    } catch (error) {
        await connection.rollback();
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'Admin' && session.role !== 'Entrenador')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { id, player, mobil, alias, birth, pos, p_name, mail, team_ids, u_id, fitness, defensive, strengths, intensity, status } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        let formattedDate = null;
        if (birth) {
            const dateObj = new Date(birth);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
            }
        }

        const config = await getNGConfig();
        const ng = calculateNG({ fitness: fitness || 5, defensive: defensive || 5, strengths: strengths || 5, intensity: intensity || 5, birth: formattedDate || '' }, config);

        // Verificar sobrenombre único (excluyendo al propio jugador)
        if (alias) {
            const [existing]: any = await pool.query('SELECT id FROM jugadores WHERE alias = ? AND id != ? AND status != "D"', [alias, id]);
            if (existing.length > 0) {
                return NextResponse.json({ error: `El sobrenombre "${alias}" ya está en uso.` }, { status: 400 });
            }
        }

        await connection.beginTransaction();

        await connection.query(
            `UPDATE jugadores 
             SET player = ?, mobil = ?, alias = ?, birth = ?, pos = ?, 
                 p_name = ?, mail = ?, u_id = ?, fitness = ?, defensive = ?, strengths = ?, intensity = ?, ng = ?, status = ?
             WHERE id = ?`,
            [player, mobil, alias, formattedDate, pos, p_name || null, mail || null, u_id || null, fitness, defensive, strengths, intensity, ng, status, id]
        );

        // Sincronizar equipos
        await connection.query('DELETE FROM jugador_equipos WHERE jugador_id = ?', [id]);
        if (Array.isArray(team_ids) && team_ids.length > 0) {
            const values = team_ids.map(tId => [id, tId]);
            await connection.query('INSERT INTO jugador_equipos (jugador_id, equipo_id) VALUES ?', [values]);
        }

        await connection.commit();

        return NextResponse.json({ message: 'Player updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
