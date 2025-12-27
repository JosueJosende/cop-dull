# CopDull
![CopDull Banner](https://placehold.co/1200x200/transparent/333?text=CopDull&font=oswald)

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-green)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow)

## Índice
- [CopDull](#copdull)
  - [Índice](#índice)
  - [Descripción del Proyecto](#descripción-del-proyecto)
  - [Estado del Proyecto](#estado-del-proyecto)
  - [Demostración de Funciones y Aplicaciones](#demostración-de-funciones-y-aplicaciones)
    - [1. Panel Visual de Marcadores](#1-panel-visual-de-marcadores)
    - [2. Organización Intuitiva (Drag \& Drop)](#2-organización-intuitiva-drag--drop)
    - [3. Buscador Potente](#3-buscador-potente)
    - [4. Limpiador de Marcadores](#4-limpiador-de-marcadores)
    - [5. Personalización Completa](#5-personalización-completa)
  - [Acceso al Proyecto](#acceso-al-proyecto)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Personas Contribuyentes](#personas-contribuyentes)
  - [Personas Desarrolladoras del Proyecto](#personas-desarrolladoras-del-proyecto)
  - [Licencia](#licencia)

---

## Descripción del Proyecto

**CopDull** (del catalán *"Cop d'ull"*, que significa "un vistazo") es una extensión para Google Chrome diseñada para transformar tu experiencia al abrir una nueva pestaña. 

Su objetivo principal es ofrecer una gestión de **marcadores** (bookmarks) visual, intuitiva y potente. Olvídate de las listas interminables de texto; CopDull organiza tus enlaces en tarjetas visuales, permitiéndote navegar por carpetas, buscar rápidamente y organizar tu contenido mediante **Drag & Drop** fluido. Además, incluye herramientas de limpieza para mantener tu navegador ordenado.

---

## Estado del Proyecto

El proyecto se encuentra actualmente en una fase **funcional y estable**. Se han implementado las características principales (core features) y se está trabajando en refinamientos de la experiencia de usuario (UX) y optimizaciones.

- [x] Visualización tipo Masonry Grid.
- [x] Navegación por carpetas.
- [x] Búsqueda en tiempo real.
- [x] Drag & Drop (Reordenar y mover a carpetas).
- [x] Herramienta de limpieza (Duplicados, carpetas vacías).
- [x] Temas (Claro/Oscuro) e Internacionalización (ES, CA, EN).
- [x] Sincronización de configuración entre dispositivos.

---

## Demostración de Funciones y Aplicaciones

### 1. Panel Visual de Marcadores
Tus marcadores se presentan en tarjetas organizadas automáticamente tipo "Masonry", aprovechando todo el espacio de tu pantalla.

### 2. Organización Intuitiva (Drag & Drop)

Mueve tus marcadores y carpetas libremente. 
- Arrastra para reordenar.
- Suelta dentro de una carpeta para mover contenido.
- Interactúa con carpetas anidadas fácilmente.

### 3. Buscador Potente
Localiza cualquier enlace al instante con la barra de búsqueda integrada en la cabecera.

### 4. Limpiador de Marcadores
Herramienta dedicada para analizar tu biblioteca y encontrar:
- Marcadores duplicados.
- Carpetas vacías.
- (Próximamente) Enlaces rotos.

### 5. Personalización Completa
- **Temas**: Cambia entre modo Claro y Oscuro según tu preferencia.
- **Idioma**: Disponible en Español, Catalán e Inglés.
- **Configuración**: Elige qué secciones ver (Apps, Recientes, etc.).

---

## Acceso al Proyecto

Para probar o desarrollar sobre CopDull:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/cop-dull.git
   ```

2. **Cargar en Chrome**:
   - Abre Chrome y ve a `chrome://extensions/`.
   - Activa el **Modo de desarrollador** (arriba a la derecha).
   - Haz clic en **Cargar descomprimida**.
   - Selecciona la carpeta donde clonaste el proyecto.

3. **Uso**:
   - Abre una nueva pestaña en Chrome (`Ctrl + T`) y verás CopDull en acción.

---

## Tecnologías Utilizadas

El proyecto está construido con tecnologías web modernas, sin frameworks pesados, para asegurar el máximo rendimiento al abrir pestañas.

- **HTML5 & CSS3**: Estructura semántica y diseño responsivo sin dependencias.
- **JavaScript (ES6 Modules)**: Lógica modular y limpia.
- **Chrome Extensions API**:
  - `chrome.bookmarks`: Gestión total de marcadores.
  - `chrome.storage`: Sincronización de configuraciones.
  - `chrome.topSites`: Acceso a sitios más visitados.
- **Librerías Externas**:
  - [MiniMasonry.js](https://spope.github.io/MiniMasonry.js/): Para el diseño de rejilla ligero (aprox 3kb).

---

## Personas Contribuyentes

¡Las contribuciones son bienvenidas! Si tienes una idea o encuentras un error:

1. Haz un Fork del proyecto.
2. Crea una rama (`git checkout -b feature/NuevaCaracteristica`).
3. Haz Commit de tus cambios (`git commit -m 'Añadir nueva característica'`).
4. Haz Push a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un Pull Request.

---

## Personas Desarrolladoras del Proyecto

- **Josué Josende** - *Desarrollador Principal* - [GitHub](https://github.com/JosueJosende)

---

## Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.