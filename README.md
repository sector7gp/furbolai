# FurbolAI ⚽🤖

FurbolAI es una aplicación web premium diseñada para gestionar jugadores de fútbol y generar equipos equilibrados de forma automática.

## 🚀 Características

- **Gestión Maestra**: Base de datos MariaDB para almacenar jugadores con estadísticas detalladas (NG, EF, CO, CD, Intensidad).
- **Lista Semanal**: Carga rápida desde archivos `.txt` para los anotados del día.
- **Equilibrio Inteligente**: Algoritmo "Snake" para distribuir jugadores según su Nivel General (NG).
- **Diseño Premium**: Interfaz moderna con Dark Mode y Glassmorphism.
- **Configuración Dinámica**: Parámetros de cálculo de nivel y reglas de negocio ajustables desde la UI.

## 🧠 Sistema de Nivel General (NG)

El Nivel General (NG) es un valor calculado que determina la habilidad de cada jugador para el balanceo de equipos.

### Lógica de Cálculo
1.  **Promedio Técnico**: Se calcula un promedio de *E. Físico*, *Defensa*, *Fortaleza* e *Intensidad*.
2.  **Ponderación**: Cada atributo tiene un peso (weight) ajustable desde la configuración (por defecto 1.0).
3.  **Factor de Edad**:
    - **Plenitud**: Rango de edad (ej. 20-32 años) donde el rendimiento es 100%.
    - **Crecimiento**: Jugadores menores al rango inician en 90% y escalan linearmente.
    - **Decaimiento**: Jugadores mayores al rango reducen su NG gradualmente (ej. 2% anual) por desgaste físico.

*(Todos los parámetros son configurables desde la sección de ajustes).*

## 🛠️ Tecnologías
...
## 📋 Requisitos Previos
...
## ⚙️ Instalación y Despliegue (Servidor)
...
## 📝 Changelog (Historial de Cambios)

### [1.0.3] - 2026-03-10
#### Añadido
- **Campo NG (Nivel General)**: Nuevo sistema de puntuación para jugadores.
- **Configuración Avanzada**: Interfaz para ajustar pesos de atributos y curva de edad del NG.
- **Campo Intensidad**: Nueva estadística técnica integrada en la base de datos y UI.
- **Recálculo Global e Individual**: Herramientas para sincronizar niveles tras cambios en la configuración.

#### Cambiado
- Rediseño del modal de edición de jugadores para mayor claridad y control.
- Restricción de atributos técnicos al rango 0-5.
- Mejoras en la persistencia de fechas y tipos de datos SQL.

### [1.0.2] - 2026-03-09
...
#### Cambiado
- Rediseño de la página de **Fútbol Semanal** para priorizar el pegado de texto (ideal para copiar/pegar desde WhatsApp en móviles).
- Eliminación de la carga de archivos .txt para simplificar la experiencia de usuario.
- Error de construcción en `globals.css` debido a incompatibilidad con Tailwind CSS v4.
- Migración de directivas `@tailwind` a `@import "tailwindcss"` y configuración `@theme`.
- Limpieza de archivos de configuración obsoletos (`tailwind.config.ts`, `postcss.config.mjs`).

---
*Desarrollado para la gestión inteligente de fútbol amateur.*
