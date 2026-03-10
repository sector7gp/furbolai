const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
    const config = Object.fromEntries(
        envContent.split('\n')
            .filter(line => line.includes('='))
            .map(line => {
                const [key, ...value] = line.split('=');
                return [key.trim(), value.join('=').trim()];
            })
    );

    const connection = await mysql.createConnection({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        port: Number(config.DB_PORT) || 3306
    });

    try {
        console.log('Creating "configuracion" table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS configuracion (
                id INT PRIMARY KEY DEFAULT 1,
                team_count INT NOT NULL DEFAULT 2,
                fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Ensure there is a single config row
        await connection.query(`
            INSERT IGNORE INTO configuracion (id, team_count) VALUES (1, 2)
        `);

        console.log('Creating "sorteos" table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sorteos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                equipos_json JSON NOT NULL,
                goles_eq1 INT NULL,
                goles_eq2 INT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
