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

- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Base de Datos**: MariaDB
- **Gestión**: PM2

## 📋 Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **Base de Datos**: MariaDB configurada con el esquema definido en `database/schema.sql`.
- **npm**: Gestor de paquetes.

## ⚙️ Instalación y Despliegue (Servidor)

Para correr la aplicación de forma persistente en un servidor propio, se recomienda el uso de **PM2**.

1.  **Instalar PM2 de forma global:**
    ```bash
    npm install -g pm2
    ```

2.  **Instalar dependencias y compilar:**
    ```bash
    npm install
    npm run build
    ```

3.  **Iniciar la aplicación con PM2:**
    ```bash
    pm2 start npm --name "furbolai" -- start -- -p 3001
    ```

4.  **Configurar para que inicie automáticamente tras un reinicio del servidor:**
    ```bash
    pm2 save
    pm2 startup
    ```
    *(Ejecuta el comando que devuelva `pm2 startup` para finalizar la configuración del sistema).*

## 📝 Changelog (Historial de Cambios)

### [1.1.0] - 2026-03-11
#### Añadido
- **Sistema de Autenticación y Perfiles**: Implementación de login seguro con JWT y Bcrypt.
- **Control de Acceso (RBAC)**: Roles diferenciados para Jugador, Entrenador y Admin con permisos específicos.
- **Cambio Obligatorio de Clave**: Flujo de seguridad para el primer ingreso con validación de complejidad.
- **Auto-registro**: Generación automática de perfiles de usuario basados en DNI existente.
- **Middleware de Seguridad**: Protección de rutas a nivel de servidor y manejo de redirecciones de sesión.

#### Cambiado
- **Dashboard Protegido**: Restricción de visibilidad y acceso a configuraciones según el rol del usuario conectado.

### [1.0.4] - 2026-03-11
#### Añadido
- **Footer Premium**: Nuevo diseño responsivo con versión Git dinámica, links a repositorio y créditos.
- **Validación de Datos**: Implementación de Regex para emails y validación numérica para DNI en el alta de jugadores.
- **Gráficos de Radar Interactivos**: Los mini-gráficos de la tabla ahora son clicables y abren un modal con detalles técnicos ampliados.

#### Cambiado
- **Privacidad de Datos**: Ofuscación de campos sensibles (Celular y DNI) en la interfaz de edición.
- **Experiencia de Usuario (UX)**: Edición de jugadores simplificada mediante clic directo en el nombre/alias (se eliminó el icono del lápiz).
- **Alineación de Interfaz**: Ajuste de alturas y espaciados en las tarjetas del Dashboard para una visualización consistente en mobile y desktop.

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
