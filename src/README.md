# Sistema de Gestión de Proyectos Colaborativo

Sistema colaborativo diseñado para que un equipo de 5 integrantes pueda organizar y dar seguimiento al desarrollo de un proyecto a través de 5 áreas principales.

## Características

### 🔐 Autenticación
Sistema de login con credenciales hardcodeadas para 5 usuarios del equipo:
- Juanito / carrito123
- Alfonso / blackmonkey
- Ximena / OliviaRodrigo4life
- Jessy / Labubu
- Andres / 4detrompo

### 📊 Dashboard
Vista general del proyecto con:
- Total de comentarios del equipo
- Total de sub-puntos/tareas definidas
- Tareas completadas y porcentaje de avance
- Vista resumida de las 5 áreas del proyecto

### 🎯 Áreas del Proyecto
El sistema gestiona 5 áreas principales:

1. **AI** - Desarrollo e implementación de IA
2. **Hardware & Code** - Desarrollo de hardware y código
3. **Interfaz** - Diseño y desarrollo de interfaz de usuario
4. **Base de Datos** - Arquitectura y gestión de datos
5. **Impresión (encapsulación)** - Impresión 3D y encapsulación

### 📝 Funcionalidades por Área

Cada área del proyecto permite:

- **Comentarios en tiempo real**: Los miembros del equipo pueden comentar sobre el progreso
- **Sub-puntos de desarrollo**: Crear tareas específicas dentro de cada área
- **Sistema de checks**: Marcar tareas como completadas
- **Seguimiento de progreso**: Barra de progreso automática basada en tareas completadas
- **Actualizaciones automáticas**: Los datos se refrescan cada 5 segundos

### 🔧 Tecnologías

- **Frontend**: React + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **Icons**: Lucide React

### 🎨 Diseño

El sistema mantiene un esquema de colores profesional y calmante:
- Teal principal: #008080
- Azul acento: #4682B4
- Tema claro con grises suaves
- Interfaz limpia y moderna

## Estructura de Datos

Los datos se almacenan en Supabase usando el sistema de Key-Value:

```
project-area:{id} - Información del área del proyecto
comment:{areaId}:{timestamp} - Comentarios por área
subpoint:{areaId}:{timestamp} - Sub-puntos/tareas por área
```

## Uso

1. Ingresa con cualquiera de las credenciales del equipo
2. Navega entre el Dashboard y las 5 áreas del proyecto
3. Agrega comentarios para actualizar al equipo sobre tu progreso
4. Crea sub-puntos para definir tareas específicas
5. Marca las tareas completadas con los checkboxes
6. Observa el progreso general en el Dashboard

## Colaboración en Tiempo Real

- Los cambios se sincronizan automáticamente cada 5 segundos
- Todos los miembros del equipo ven las mismas actualizaciones
- Cada comentario y tarea muestra quién lo creó y cuándo
