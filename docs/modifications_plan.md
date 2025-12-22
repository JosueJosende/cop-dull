# Plan de Modificaciones y Nuevas Funcionalidades

Este documento detalla el plan de trabajo para implementar las funcionalidades solicitadas y sugeridas para la extensión "Cop d'ull".

## Funcionalidades Solicitadas

### 1. Búsqueda de Favoritos Guardados (IMPLEMENTADO)
**Objetivo**: Permitir al usuario encontrar rápidamente un marcador por su título o URL.
**Implementación**:
- Agregar una barra de búsqueda fija en la parte superior (`<header>`).
- Implementar un filtrado en tiempo real: al escribir, ocultar las tarjetas/enlaces que no coincidan.
- Opcional: Mostrar una vista de "Resultados de búsqueda" superpuesta si el filtrado en las tarjetas es confuso.
- **Prioridad**: Alta.

### 2. Mostrar y Ejecutar Aplicaciones de Navegador
**Objetivo**: Listar las aplicaciones de Chrome instaladas y permitir abrirlas.
**Implementación**:
- Descomentar y reactivar el módulo `apps.js`.
- Asegurar que `chrome.management` tiene permisos en `manifest.json` (ya está presente).
- Renderizar las aplicaciones en una sección separada o integrada en el layout masonry.
- **Prioridad**: Media.

### 3. Modificar y Eliminar Favoritos
**Objetivo**: Gestión completa de marcadores desde la nueva pestaña.
**Implementación**:
- **Menú Contextual**: Añadir menú click derecho en cada marcador.
- **Acciones**:
  - **Editar**: Abrir un modal para cambiar Título y URL. Usar `chrome.bookmarks.update`.
  - **Eliminar**: Mostrar confirmación y borrar usando `chrome.bookmarks.remove`.
- **Actualización UI**: Reflejar los cambios inmediatamente en el DOM sin recargar.
- **Prioridad**: Alta.

## Funcionalidades Sugeridas

### 4. Gestor de Pestañas Recientes y Top Sites
**Descripción**: Reactivar los módulos `recentTabs.js` y `topSites.js`.
**Beneficio**: Acceso rápido a la navegación previa.
**Implementación**: Similar a `apps.js`, asegurar visualización limpia.

### 5. Drag & Drop (Arrastrar y Soltar)
**Descripción**: Permitir reordenar marcadores y moverlos entre carpetas.
**Beneficio**: Mejor organización visual.
**Implementación**: Usar API HTML5 Drag and Drop o una librería ligera. Actualizar `chrome.bookmarks.move`.

### 6. Temas y Personalización
**Descripción**: Modo Claro/Oscuro y colores de acento.
**Beneficio**: Mejor experiencia de usuario.
**Implementación**: Variables CSS y persistencia en `localStorage` o `chrome.storage`.

### 7. Sincronización de Configuración
**Descripción**: Guardar preferencias (orden, temas) en la cuenta de Google.
**Implementación**: Usar `chrome.storage.sync`.

### 8. Limpieza de marcadores
**Descripción**: Eliminar marcadores que se repiten, marcadores que no se usan y marcadores que no existen.
**Beneficio**: Mejor organización visual.
**Implementación**: Añadir un botón de "limpiar marcadores" y visualizar los marcadores que se van a eliminar, el usuario debe confirmar la eliminación.

### 9. Mejorar navegación por carpetas (IMPLEMENTADO)
**Descripción**: Permitir navegar por carpetas de manera más intuitiva.
**Beneficio**: Mejor experiencia de usuario.
**Implementación**: Añadir un botón de "volver atras" en vez de navegación "miga de pan" (breadcrumbs) en la cabecera de la tarjeta para volver atrás. Ejemplo: en la parte izquierda mostrar el nombre de la carpeta actual y un botón de "volver atras" en la parte derecha que permita volver a la carpeta anterior.

## Hoja de Ruta (Roadmap)

### Fase 1: Reactivación y Limpieza
- [ ] Reactivar `apps.js` y mostrar aplicaciones.
- [ ] Reactivar `recentTabs.js` (opcional, evaluar impacto visual).
- [ ] Limpiar y unificar estilos CSS.

### Fase 2: Funcionalidades Core (User Requests)
- [x] Implementar Barra de Búsqueda.
- [x] Implementar Editar/Eliminar Marcadores (UI + Lógica).

### Fase 3: Experiencia de Usuario
- [ ] Añadir animaciones de transición.
- [ ] Mejorar el diseño de las tarjetas (feedback visual al hacer hover).
- [ ] Implementar Drag & Drop básico.

### Fase 4: Configuración
- [ ] Panel de preferencias (toggle para mostrar/ocultar Apps, Recientes, etc.).
- [ ] Selección de Tema.
