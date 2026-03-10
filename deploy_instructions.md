# Pasos para la Implementación en Producción

Sigue estos pasos cuidadosamente para desplegar los últimos cambios de estructura de la tabla `jugadores` y el código actualizado en tu entorno de producción.

## 1. Respaldo de Base de Datos (Backup)
Antes de realizar cualquier cambio estructural en una base de datos de producción, es fundamental crear un respaldo.

1.  Conéctate a tu servidor de base de datos de producción o utiliza tu herramienta de administración (como phpMyAdmin, MySQL Workbench, o la línea de comandos).
2.  Genera un volcado (dump) completo de la base de datos `furbolai` (o al menos de la tabla `jugadores`).
    ```bash
    mysqldump -u [usuario] -p [nombre_base_datos] > backup_furbolai_antes_migracion.sql
    ```

## 2. Ejecutar la Migración Estructural (SQL)
Aplica los cambios de esquema estructurado que creamos.

1.  Abre el archivo `patch_jugadores_migration.sql` que se encuentra en la raíz del proyecto.
2.  Copia todo el contenido de ese archivo.
3.  Pégalo y ejecútalo en la consola SQL de tu base de datos de producción.

**Contenido del script para referencia:**
```sql
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
```

## 3. Desplegar el Nuevo Código
Una vez que la base de datos esté lista, debes actualizar la aplicación.

1.  Conéctate mediante SSH a tu servidor de producción o accede a la plataforma de hosting que utilices (Vercel, AWS, servidor propio, etc.).
2.  Si estás clonando desde Git en el servidor, ejecuta:
    ```bash
    git pull origin main
    ```
3.  (Opcional pero recomendado) Instala las dependencias por si hubo cambios:
    ```bash
    npm install
    ```
4.  Compila la aplicación Next.js para producción:
    ```bash
    npm run build
    ```
5.  Reinicia el servicio de la aplicación (por ejemplo, si usas PM2 o algún gestor de servicios):
    ```bash
    pm2 restart furbolai
    # O el comando que utilices para reiniciar tu app
    ```

## 4. Verificación Post-Despliegue
Accede a la URL pública de tu aplicación en producción.

1.  Ve a la sección de **Jugadores**.
2.  Fuerza la recarga de la página (Ctrl+F5 o Cmd+Shift+R) para asegurarte de cargar los nuevos assets (si es necesario).
3.  Comprueba que la lista de jugadores carga sin errores y no muestra las columnas antiguas (`NG`, `CO`).
4.  Intenta editar a un jugador existente para verificar que los nuevos mods funcionan y guardan los datos en la base de datos actualizada.
5.  Si todo funciona correctamente, la implementación ha sido un éxito. De lo contrario, revisa los logs del servidor para identificar el problema o si es crítico, restaura la base de datos con el backup del paso 1 y revierte el commit a la versión anterior.
