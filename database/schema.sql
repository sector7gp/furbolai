-- FurbolAI Database Schema
-- Creation date: 2026-03-09
-- Last updated:  2026-03-13 (v1.1.3)

CREATE DATABASE IF NOT EXISTS furbolai;
USE furbolai;

CREATE TABLE IF NOT EXISTS jugadores (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    player VARCHAR(255) NOT NULL,
    mobil VARCHAR(50),
    alias VARCHAR(100),
    birth DATE,
    pos TEXT,      -- Número de posición primaria (e.g. '1' = GK, '9' = DEL)
    -- IMPORTANTE: p_name acepta múltiples posiciones separadas por coma en orden de preferencia
    --             Ejemplo: 'GK,LI' significa que juega primero de GK, y de lateral izq. como alternativa
    fitness DECIMAL(4),
    defensive DECIMAL(4),
    strengths DECIMAL(4),
    status CHAR(1) DEFAULT 'A', -- A para Activo, I para Inactivo
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_baja TIMESTAMP NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    p_name VARCHAR(255), -- Nombres de posición separados por coma, en orden de preferencia (e.g. 'GK,LI')
    mail VARCHAR(255),
    t_id INT(11),
    u_id VARCHAR(50),
    intensity DECIMAL(10,0),
    ng DECIMAL(3,1)
);

CREATE TABLE IF NOT EXISTS configuracion (
    id INT PRIMARY KEY DEFAULT 1,
    team_count INT NOT NULL DEFAULT 2,
    t_id INT NULL,              -- (v1.1.3) ID del equipo/grupo para filtrar jugadores en el sorteo semanal
    w_fitness FLOAT DEFAULT 1.0,
    w_defensive FLOAT DEFAULT 1.0,
    w_strengths FLOAT DEFAULT 1.0,
    w_intensity FLOAT DEFAULT 1.0,
    age_min INT DEFAULT 20,
    age_max INT DEFAULT 32,
    age_decay FLOAT DEFAULT 0.02,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/*
-- MIGRACIÓN v1.1.3 --
-- Ejecutar este script si ya tenés la DB con la versión anterior:

ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS t_id INT NULL;

-- El campo t_id filtra la búsqueda de jugadores al grupo/equipo configurado.
-- Si es NULL, el sistema busca en todos los jugadores activos (status='A').
*/

CREATE TABLE IF NOT EXISTS sorteos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipos_json JSON NOT NULL,
    goles_eq1 INT NULL,
    goles_eq2 INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- DNI del jugador
    password VARCHAR(255) NOT NULL,
    role ENUM('Jugador', 'Entrenador', 'Admin') NOT NULL DEFAULT 'Jugador',
    must_change_password BOOLEAN DEFAULT TRUE,
    player_id INT NULL, -- Vinculación opcional con la tabla jugadores
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_player_user FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE SET NULL
);

/*
-- GUIA DE IMPORTACION DE CSV --

Para importar un archivo CSV a la tabla 'jugadores', sigue estos pasos:

1. Asegúrate de que el CSV tenga el formato correcto acorde a las columnas (excluyendo 'id' y campos automáticos si lo prefieres).
   Ejemplo de CSV (jugadores.csv):
   "Juan Perez","+549111223344","Juancho","1990-05-15","GK,MC",7.5,8.0,6.0,"A"

2. Ejecuta el comando LOAD DATA INFILE desde la consola de MariaDB o MySQL:

LOAD DATA LOCAL INFILE '/ruta/al/archivo/jugadores.csv'
INTO TABLE jugadores
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES -- Si el CSV tiene encabezados
(player, mobil, alias, birth, pos, fitness, defensive, strengths);

Nota: Asegúrate de tener habilitado 'local_infile' en el cliente y el servidor:
SET GLOBAL local_infile = 1;
*/
