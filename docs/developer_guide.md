# Guía para Desarrolladores

## Configuración del Entorno

### Cargar la extensión en Chrome
1.  Abre Google Chrome y navega a `chrome://extensions/`.
2.  Activa el **"Modo de desarrollador"** (interruptor en la esquina superior derecha).
3.  Haz clic en el botón **"Cargar descomprimida"** (Load unpacked).
4.  Selecciona la carpeta raíz del proyecto (`cop-dull`).

### Desarrollo y Recarga
*   Cada vez que modifiques un archivo (JS, HTML, CSS), debes recargar la extensión.
*   En la página de `chrome://extensions/`, busca la tarjeta de "Cop d'ull" y haz clic en el icono de **Recargar** (flecha circular).
*   Abre una nueva pestaña para ver los cambios.

## Depuración
*   Para ver los logs (`console.log`), abre una nueva pestaña (donde corre la extensión), haz clic derecho en cualquier lugar de la página y selecciona **"Inspeccionar"**.
*   Esto abrirá las DevTools habituales.
*   Nota: Los scripts de `background.js` tienen su propia consola. Ve a `chrome://extensions/` y haz clic en "service worker" (si aplica) para ver sus logs.

## Estructura de Estilos
*   `copdull.css` contiene los estilos globales.
*   El diseño masonry se gestiona vía JS (`minimasonry`), pero el CSS define el ancho de las columnas/tarjetas.
