const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🚀 Iniciando migración: Sistema de Invitaciones...');

    // Parse .env manually
    let config = {};
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        config = Object.fromEntries(
            envContent.split('\n')
                .filter(line => line.includes('='))
                .map(line => {
                    const [key, ...value] = line.split('=');
                    return [key.trim(), value.join('=').trim()];
                })
        );
    } catch (err) {
        console.error('❌ Error leyendo archivo .env:', err.message);
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        port: Number(config.DB_PORT) || 3306,
        multipleStatements: true
    });

    try {
        const sqlPath = path.join(__dirname, '../database/v1.2.2_invitations.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Ejecutando script SQL...');
        await connection.query(sql);

        console.log('✅ Migración completada con éxito.');
        console.log('   Tabla "invitaciones" creada/verificada.');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration();
