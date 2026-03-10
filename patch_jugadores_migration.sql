-- Migration para actualizar la tabla JUGADORES

ALTER TABLE jugadores
  RENAME COLUMN jugador TO player,
  RENAME COLUMN celular TO mobil,
  RENAME COLUMN fecha_nacimiento TO birth,
  RENAME COLUMN posiciones TO pos,
  RENAME COLUMN ef TO fitness,
  RENAME COLUMN cd TO defensive,
  RENAME COLUMN intensidad TO strengths,
  RENAME COLUMN estado TO status;

ALTER TABLE jugadores
  ADD COLUMN p_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN mail VARCHAR(255) DEFAULT NULL,
  ADD COLUMN t_id INT DEFAULT NULL,
  ADD COLUMN u_id VARCHAR(50) DEFAULT NULL;

ALTER TABLE jugadores
  DROP COLUMN ng,
  DROP COLUMN co;
