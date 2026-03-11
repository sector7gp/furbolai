import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'furbolai-default-secret-change-me';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
    userId: number;
    username: string;
    role: 'Jugador' | 'Entrenador' | 'Admin';
    mustChangePassword: boolean;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(encodedSecret);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, encodedSecret);
        return payload as any as SessionPayload;
    } catch (e) {
        return null;
    }
}
