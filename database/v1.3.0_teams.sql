-- Migración v1.3.0 - Sistema de Equipos y Permisos
-- Implementación de relación Muchos-a-Muchos para jugadores y visibilidad por usuario

-- 1. Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Relación Jugadores <-> Equipos
CREATE TABLE IF NOT EXISTS jugador_equipos (
    jugador_id INT NOT NULL,
    equipo_id INT NOT NULL,
    PRIMARY KEY (jugador_id, equipo_id),
    CONSTRAINT fk_je_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_je_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- 3. Relación Usuarios <-> Equipos (Permisos)
CREATE TABLE IF NOT EXISTS usuario_equipos (
    usuario_id INT NOT NULL,
    equipo_id INT NOT NULL,
    PRIMARY KEY (usuario_id, equipo_id),
    CONSTRAINT fk_ue_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ue_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- 4. Insertar equipo por defecto (ID 1) si no existe para migrar datos actuales
INSERT IGNORE INTO equipos (id, nombre, descripcion) VALUES (1, 'Equipo Principal', 'Equipo migrado automáticamente');

-- 5. Migrar datos existentes de jugadores.t_id a la nueva tabla
INSERT IGNORE INTO jugador_equipos (jugador_id, equipo_id)
SELECT id, t_id FROM jugadores WHERE t_id IS NOT NULL;

-- 6. Asignar permiso al primer admin para el equipo 1
INSERT IGNORE INTO usuario_equipos (usuario_id, equipo_id)
SELECT id, 1 FROM usuarios WHERE role = 'Admin' LIMIT 1;

-- 7. Modificar tabla invitaciones para soportar múltiples equipos (como string)
ALTER TABLE invitaciones MODIFY COLUMN t_id VARCHAR(255) NULL;
