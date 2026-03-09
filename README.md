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

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev
```

## 🗄️ Base de Datos

Ejecuta el script en `database/schema.sql` para crear la estructura necesaria. Para importar datos masivos:

```sql
LOAD DATA LOCAL INFILE 'jugadores.csv' INTO TABLE jugadores ...
```

## 📝 Changelog (Historial de Cambios)

### [1.0.0] - 2026-03-09
#### Añadido
- Inicialización del proyecto con Next.js y TypeScript.
- Configuración de proxy para entornos corporativos (`.npmrc`).
- Script de base de datos MariaDB con soporte para `fecha_nacimiento`.
- Dashboard de **Gestión de Jugadores** con búsqueda y filtros.
- Módulo de **Fútbol Semanal** con parser de archivos `.txt`.
- Algoritmo de generación de equipos balanceados.
- README.md inicial y documentación del proyecto.

---
*Desarrollado para la gestión inteligente de fútbol amateur.*
