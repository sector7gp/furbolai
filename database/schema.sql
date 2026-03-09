-- FurbolAI Database Schema
-- Creation date: 2026-03-09

CREATE DATABASE IF NOT EXISTS furbolai;
USE furbolai;

CREATE TABLE IF NOT EXISTS jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador VARCHAR(255) NOT NULL,
    celular VARCHAR(50),
    alias VARCHAR(100),
    fecha_nacimiento DATE,
    posiciones TEXT, -- Comma separated values (e.g., GK,MC,ST)
    ng DECIMAL(4,2), -- Nivel General
    ef DECIMAL(4,2), -- Estado Fisico
    co DECIMAL(4,2), -- Capacidad Ofensiva
    cd DECIMAL(4,2), -- Capacidad Defensiva
    intensidad DECIMAL(4,2), -- Intensidad (I)
    estado CHAR(1) DEFAULT 'A', -- A para Activo, I para Inactivo
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_baja TIMESTAMP NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/*
-- GUIA DE IMPORTACION DE CSV --

Para importar un archivo CSV a la tabla 'jugadores', sigue estos pasos:

1. Asegúrate de que el CSV tenga el formato correcto acorde a las columnas (excluyendo 'id' y campos automáticos si lo prefieres).
   Ejemplo de CSV (jugadores.csv):
   "Juan Perez","+549111223344","Juancho","1990-05-15","GK,MC",7.5,8.0,6.0,9.0,8.5

2. Ejecuta el comando LOAD DATA INFILE desde la consola de MariaDB o MySQL:

LOAD DATA LOCAL INFILE '/ruta/al/archivo/jugadores.csv'
INTO TABLE jugadores
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES -- Si el CSV tiene encabezados
(jugador, celular, alias, fecha_nacimiento, posiciones, ng, ef, co, cd, intensidad);

Nota: Asegúrate de tener habilitado 'local_infile' en el cliente y el servidor:
SET GLOBAL local_infile = 1;
*/
