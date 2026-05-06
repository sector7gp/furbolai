-- Migración v1.2.2 - Sistema de Invitaciones Seguras
-- Añade tabla para tokens temporales de invitación

CREATE TABLE IF NOT EXISTS invitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    t_id INT NULL,               -- Equipo opcional al que se invita
    usado BOOLEAN DEFAULT FALSE,  -- Si el token ya fue consumido
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL,
    CONSTRAINT fk_inv_team FOREIGN KEY (t_id) REFERENCES configuracion(t_id) ON DELETE SET NULL
);
