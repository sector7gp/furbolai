# FurbolAI ⚽🤖

FurbolAI es una aplicación web premium diseñada para gestionar jugadores de fútbol y generar equipos equilibrados de forma automática.

## 🚀 Características

- **Gestión Maestra**: Base de datos MariaDB para almacenar jugadores con estadísticas detalladas (NG, EF, CO, CD, Intensidad).
- **Lista Semanal**: Carga rápida desde archivos `.txt` para los anotados del día.
- **Equilibrio Inteligente**: Algoritmo "Snake" para distribuir jugadores según su Nivel General (NG).
- **Diseño Premium**: Interfaz moderna con Dark Mode y Glassmorphism.

## 🛠️ Tecnologías

- **Framework**: Next.js 15+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Lucide Icons
- **Base de Datos**: MariaDB / MySQL
- **Animaciones**: Framer Motion

## 📋 Requisitos Previos

1. **MariaDB**: Una instancia corriendo local o remotamente.
2. **Node.js**: v18.0.0 o superior.
3. **Variables de Entorno**: Configurar el archivo `.env` basado en `.env.example`.

## ⚙️ Instalación y Despliegue (Servidor)

Sigue estos pasos cuidadosamente para desplegar la aplicación en un nuevo servidor:

1. **Clonar el repositorio e instalar dependencias:**
```bash
git clone https://github.com/sector7gp/furbolai.git
cd furbolai
npm install
```

2. **Configurar Variables de Entorno (.env):**
Crea el archivo `.env` en la raíz del proyecto. Este paso es **CRÍTICO**; sin él, la app dará error de "Connection ETIMEDOUT" al intentar conectarse a la Base de Datos.
```bash
cp .env.example .env
# Edita el archivo .env con las credenciales de tu base de datos MariaDB:
# DB_HOST=localhost (o la IP de tu servidor BD)
# DB_PORT=3306
# DB_USER=tu_usuario
# DB_PASSWORD=tu_password
# DB_NAME=furbolai
```

3. **Preparar la Base de Datos (Migraciones):**
Crea la estructura de tablas inicial:
```bash
# Paso 1: Importa la estructura base (jugadores)
mysql -u tu_usuario -p furbolai < database/schema.sql

# Paso 2: Ejecuta la migración v2 para crear tablas de configuracion y sorteos
node migrate-v2.js
```

4. **Compilar y Ejecutar en Producción:**
Para servidores de hosteo, **NO utilices** `npm run dev`. Debes compilar la app primero.
```bash
# 1. Crear el build de producción
npm run build

# 2. Iniciar el servidor (Correrá en el puerto 3001)
npm run start
```
*(Para mantener la app corriendo en segundo plano, se recomienda usar `pm2` o un servicio de `systemd`).*

## 📝 Changelog (Historial de Cambios)

### [1.0.2] - 2026-03-09
#### Cambiado
- Rediseño de la página de **Fútbol Semanal** para priorizar el pegado de texto (ideal para copiar/pegar desde WhatsApp en móviles).
- Eliminación de la carga de archivos .txt para simplificar la experiencia de usuario.
- Error de construcción en `globals.css` debido a incompatibilidad con Tailwind CSS v4.
- Migración de directivas `@tailwind` a `@import "tailwindcss"` y configuración `@theme`.
- Limpieza de archivos de configuración obsoletos (`tailwind.config.ts`, `postcss.config.mjs`).

---
*Desarrollado para la gestión inteligente de fútbol amateur.*
