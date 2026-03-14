[![Invitame un café en cafecito.app](https://cdn.cafecito.app/imgs/buttons/button_4.svg)](https://cafecito.app/sector7gp)

# FurbolAI ⚽🤖

FurbolAI es una aplicación web premium diseñada para gestionar jugadores de fútbol y generar equipos equilibrados de forma automática.

## 🚀 Características

- **Gestión Maestra**: Base de datos MariaDB para almacenar jugadores con estadísticas detalladas (NG, EF, CO, CD, Intensidad).
- **Lista Semanal**: Pegado directo desde WhatsApp con limpieza automática de emojis, números y bullets.
- **Equilibrio Inteligente**: Algoritmo Snake por líneas (GK → DEF → MID → FWD) con equipos de **tamaño estrictamente igual**.
- **Posiciones Flexibles**: Un jugador puede tener múltiples posiciones en orden de preferencia (ej. `GK,LI`). Si el arco está cubierto, juega como lateral.
- **Plan B de Arquero**: Modal automático de selección manual cuando faltan arqueros en la lista semanal.
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

### [1.1.5] - 2026-03-14
#### Añadido
- **Creación Persistente de Jugadores**: Ahora es posible crear nuevos jugadores directamente desde el modal de emparejamiento. Los jugadores se guardan en la base de datos con su nivel (NG) calculado automáticamente y se integran de inmediato al sorteo actual.
- **Sincronización de Datos API/UI**: Mejora en la comunicación entre el backend y frontend para asegurar que las estadísticas de nuevos jugadores se reflejen correctamente sin recargar la página.

### [1.1.4] - 2026-03-14
#### Añadido
- **Matcher de Jugadores**: Nuevo sistema de detección de jugadores desconocidos al pegar la lista de WhatsApp. Permite vincular nombres no reconocidos con jugadores existentes en la base de datos o darlos de alta como nuevos, manteniendo la integridad de las estadísticas.
- **Normalización de Nombres**: Mejoras en el algoritmo de comparación para ignorar tildes y caracteres especiales de forma más robusta.

### [1.1.3] - 2026-03-13
#### Añadido
- **Plan B de Arquero**: Si la lista semanal no contiene suficientes arqueros (menos que la cantidad de equipos), se activa automáticamente un **modal de selección manual**. El coordinador designa a cualquier jugador de la lista para el arco; el rol se aplica solo para ese sorteo, sin modificar la base de datos.
- **Posiciones flexibles (multi-posición)**: El campo `p_name` acepta múltiples posiciones separadas por coma en orden de preferencia (ej. `GK,LI`). Si los slots de arquero ya están cubiertos, el jugador se reclasifica automáticamente a su posición secundaria.
- **Equipos de igual tamaño (estricto)**: Se garantiza que todos los equipos tengan exactamente `⌊N / cant_equipos⌋` jugadores. Los jugadores sobrantes (menor NG) se muestran en un **Banco** sin participar del sorteo.
- **Generación por líneas**: El snake draft opera por categoría táctica: GK → DEF → MID → FWD. Los jugadores sin posición reconocida se distribuyen por balance de NG.
- **Matcheo de nombres mejorado**: Normalización de tildes/acentos para comparar nombres pegados de WhatsApp con la DB. Limpieza automática de emojis, bullets y numeración.
- **Botón "Probar de nuevo"**: En la vista de equipos, permite re-correr el algoritmo con los mismos jugadores sin volver a pegar la lista.
- **Filtro por equipo (`t_id`)**: La búsqueda de jugadores puede limitarse al grupo configurado mediante el nuevo campo `t_id` en la tabla `configuracion`.

#### Cambiado
- **Algoritmo de sorteo**: Reemplaza la clasificación numérica por una categorización semántica (GK / DEF / MID / FWD) con soporte de aliases en español e inglés.
- **Visualización de posiciones**: Etiquetas con colores por línea (🟡 GK · 🔵 DEF · 🟣 MID · 🔴 FWD).

#### Base de datos — Migración requerida
```sql
-- Agregar columna t_id a la tabla configuracion:
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS t_id INT NULL;
```

### [1.1.2] - 2026-03-11

#### Añadido
- **Balanceo Táctico Inteligente**: El algoritmo de sorteo ahora prioriza la distribución de Arqueros (**GK**) y posiciones tácticas clave (**2, 3, 4, 5, 7, 9, 11**).
- **Prioridad del Arquero**: Se garantiza que el arquero (detectado como "1", "GK" o "Arquero") sea siempre el primer integrante de cada lista.
- **Visualización de Roles**: La tabla de resultados muestra el nombre completo de la posición (**p_name**) para un mejor contexto táctico.
- **Exportación Optimizada**: Nueva generación de imagen JPG para WhatsApp, simplificada para evitar recortes y con el **Promedio NG** destacado por equipo.

#### Cambiado
- **Integración con Base de Datos**: El sorteo semanal ahora recupera dinámicamente el NG y los atributos técnicos de los jugadores registrados.
- **Layout de Resultados**: Rediseño a dos columnas para facilitar la comparación de fuerzas entre equipos.

### [1.1.1] - 2026-03-11
#### Añadido
- **Selección de Posiciones (UI)**: Nuevo diseño basado en **Chips/Pills** para una selección de posiciones más compacta y moderna.
- **Consistencia en Altas**: Se integró el selector de posiciones al modal de "Nuevo Jugador".
- **Identidad Personalizada**: El sistema ahora muestra el **Alias** o **Nombre** del jugador en la barra de navegación en lugar de su DNI.

#### Cambiado
- **Refactor de Infraestructura**: Migración de `middleware.ts` a `proxy.ts` siguiendo las últimas convenciones de Next.js 16 para mejorar la seguridad y claridad del tráfico.

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
