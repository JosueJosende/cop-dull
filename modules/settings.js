
import { fadeIn, fadeOut } from './search.js'

// Default Configuration
const DEFAULT_CONFIG = {
  theme: 'light',
  language: 'es',
  showRecentTop: true,
  showCleaner: true,
  showApps: false // Although apps.js is off, we prep for it
}

let currentConfig = { ...DEFAULT_CONFIG }

// Full Dictionary
const I18N = {
  es: {
    // Settings
    settingsTitle: 'Configuración',
    general: 'General',
    appearance: 'Apariencia',
    language: 'Idioma',
    showRecents: 'Mostrar Recientes / Top Sites',
    showRecentsDesc: 'Habilita el botón y la vista de sitios recientes en la cabecera.',
    showCleaner: 'Limpiador',
    showCleanerDesc: 'Habilita la herramienta de limpieza de marcadores.',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    selectLang: 'Seleccionar Idioma',
    
    // Header
    searchPlaceholder: 'Buscar...',
    recentsBtn: 'Recientes/Top',
    cleanBtn: 'Limpiar',
    addFolderTitle: 'Añadir carpeta',
    settingsTitleBtn: 'Configuración',

    // Cleaner
    cleanerTitle: 'Limpieza de Marcadores',
    cleanerDuplicates: 'Marcadores Duplicados',
    cleanerEmptyFolders: 'Carpetas Vacías',
    cleanerBrokenLinks: 'Enlaces Rotos',
    cleanerScan: 'Escanear',
    cleanerDeleteSelected: 'Eliminar Seleccionados',
    cleanerEmptyMsg: 'No se encontraron elementos.',
    cleanerAnalysing: 'Analizando...',
    cleanerScanMsg: 'Presiona escanear para buscar enlaces rotos.',
    
    // Dashboard
    topSites: 'Sitios Más Visitados',
    recentTabs: 'Pestañas Recientes',
    
    // Context Menus
    ctxClone: 'Clonar',
    ctxOpenTab: 'Abrir en pestaña nueva',
    ctxEdit: 'Editar',
    ctxDelete: 'Eliminar',
    
    ctxEditName: 'Editar Nombre',
    ctxNewFolder: 'Nueva Carpeta',
    ctxOpenAll: 'Abrir Todo',
    ctxDelFolder: 'Eliminar Carpeta',
    
    // Modals
    modalEditTitle: 'Editar Favorito',
    modalEditLabelTitle: 'Título',
    modalEditLabelUrl: 'URL',
    modalSave: 'Guardar',
    modalCancel: 'Cancelar',
    
    modalNewFolderTitle: 'Nueva Carpeta',
    modalNewFolderLabel: 'Nombre de la carpeta',
    modalCreate: 'Crear',
    modalCancel2: 'Cancelar',
    
    // Generic Modals
    modalConfirmTitle: 'Confirmar',
    modalInfoTitle: 'Información',
    modalAccept: 'Aceptar',
    modalCancelGeneric: 'Cancelar',
    msgConfirmDelete: '¿Estás seguro de que quieres eliminar el marcador?',
    msgCleanerCompleted: 'Limpieza completada.'
  },
  en: {
    // Settings
    settingsTitle: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    language: 'Language',
    showRecents: 'Show Recents / Top Sites',
    showRecentsDesc: 'Enable the Recents button and view in the header.',
    showCleaner: 'Cleaner',
    showCleanerDesc: 'Enable the bookmark cleaner tool.',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    selectLang: 'Select Language',

    // Header
    searchPlaceholder: 'Search...',
    recentsBtn: 'Recents/Top',
    cleanBtn: 'Clean',
    addFolderTitle: 'Add Folder',
    settingsTitleBtn: 'Settings',

    // Cleaner
    cleanerTitle: 'Bookmark Cleaner',
    cleanerDuplicates: 'Duplicate Bookmarks',
    cleanerEmptyFolders: 'Empty Folders',
    cleanerBrokenLinks: 'Broken Links',
    cleanerScan: 'Scan',
    cleanerDeleteSelected: 'Delete Selected',
    cleanerEmptyMsg: 'No items found.',
    cleanerAnalysing: 'Analyzing...',
    cleanerScanMsg: 'Press scan to find broken links.',

    // Dashboard
    topSites: 'Top Sites',
    recentTabs: 'Recent Tabs',

    // Context Menus
    ctxClone: 'Clone',
    ctxOpenTab: 'Open in new tab',
    ctxEdit: 'Edit',
    ctxDelete: 'Delete',
    
    ctxEditName: 'Edit Name',
    ctxNewFolder: 'New Folder',
    ctxOpenAll: 'Open All',
    ctxDelFolder: 'Delete Folder',

    // Modals
    modalEditTitle: 'Edit Bookmark',
    modalEditLabelTitle: 'Title',
    modalEditLabelUrl: 'URL',
    modalSave: 'Save',
    modalCancel: 'Cancel',

    modalNewFolderTitle: 'New Folder',
    modalNewFolderLabel: 'Folder Name',
    modalCreate: 'Create',
    modalCancel2: 'Cancel',

    // Generic Modals
    modalConfirmTitle: 'Confirm',
    modalInfoTitle: 'Information',
    modalAccept: 'Yes',
    modalCancelGeneric: 'No',
    msgConfirmDelete: 'Are you sure you want to delete this bookmark?',
    msgCleanerCompleted: 'Clean completed.'
  },
  ca: {
    // Settings
    settingsTitle: 'Configuració',
    general: 'General',
    appearance: 'Aparença',
    language: 'Idioma',
    showRecents: 'Mostrar Recents / Top Sites',
    showRecentsDesc: 'Habilita el botó i la vista de llocs recents a la capçalera.',
    showCleaner: 'Netejador',
    showCleanerDesc: 'Habilita l\'eina de neteja de marcadors.',
    theme: 'Tema',
    themeLight: 'Clar',
    themeDark: 'Fosc',
    selectLang: 'Seleccionar Idioma',

    // Header
    searchPlaceholder: 'Cerca...',
    recentsBtn: 'Recents/Top',
    cleanBtn: 'Neteja',
    addFolderTitle: 'Afegir carpeta',
    settingsTitleBtn: 'Configuració',

    // Cleaner
    cleanerTitle: 'Neteja de Marcadors',
    cleanerDuplicates: 'Marcadors Duplicats',
    cleanerEmptyFolders: 'Carpetes Buides',
    cleanerBrokenLinks: 'Enllaços Trencats',
    cleanerScan: 'Escanejar',
    cleanerDeleteSelected: 'Eliminar Seleccionats',
    cleanerEmptyMsg: 'No s\'han trobat elements.',
    cleanerAnalysing: 'Analitzant...',
    cleanerScanMsg: 'Prem escanejar per cercar enllaços trencats.',

    // Dashboard
    topSites: 'Llocs Més Visitats',
    recentTabs: 'Pestanyes Recents',

    // Context Menus
    ctxClone: 'Clonar',
    ctxOpenTab: 'Obrir en pestanya nova',
    ctxEdit: 'Editar',
    ctxDelete: 'Eliminar',
    
    ctxEditName: 'Editar Nom',
    ctxNewFolder: 'Nova Carpeta',
    ctxOpenAll: 'Obrir Tot',
    ctxDelFolder: 'Eliminar Carpeta',

    // Modals
    modalEditTitle: 'Editar Favorit',
    modalEditLabelTitle: 'Títol',
    modalEditLabelUrl: 'URL',
    modalSave: 'Desar',
    modalCancel: 'Cancel·lar',

    modalNewFolderTitle: 'Nova Carpeta',
    modalNewFolderLabel: 'Nom de la carpeta',
    modalCreate: 'Crear',
    modalCancel2: 'Cancel·lar',

    // Generic Modals
    modalConfirmTitle: 'Confirmar',
    modalInfoTitle: 'Informació',
    modalAccept: 'Acceptar',
    modalCancelGeneric: 'Cancel·lar',
    msgConfirmDelete: 'Estàs segur de que vols eliminar aquest marcador?',
    msgCleanerCompleted: 'Neteja completada.'
  }
}

// ... existing initSettings ...

export function applyTranslations() {
  const t = I18N[currentConfig.language] || I18N.es
  
  // Header
  // ...
  
  // Generic Modals
  safeTextContent('confirmTitle', t.modalConfirmTitle)
  safeTextContent('infoTitle', t.modalInfoTitle)
  safeTextContent('confirmOkBtn', t.modalAccept)
  safeTextContent('confirmCancelBtn', t.modalCancelGeneric)
  safeTextContent('infoOkBtn', t.modalAccept)

  // ... (rest of function)
  safeTextContent('toggleRecentsBtn', t.recentsBtn)
  safeTextContent('cleanerBtn', t.cleanBtn)
  safeTitle('toggleRecentsBtn', t.recentsBtn)
  safeTitle('cleanerBtn', t.cleanBtn)
  safeTitle('addFolderBtn', t.addFolderTitle)
  safeTitle('settingsBtn', t.settingsTitleBtn)
  
  const searchInput = document.getElementById('searchInput')
  if (searchInput) searchInput.placeholder = t.searchPlaceholder

  // Cleaner Headers (Dynamic elements might overwrite this, so cleaner needs to use getter)
  // We will update static IDs if they exist
  safeTextContent('dupCount', '0') // No, don't overwrite count
  // We can't easily update cleaner partial texts if they are embedded with structure.
  // Best approach: Re-render cleaner structure ON OPEN if language changed?
  // Or update specific semantic IDs.
  
  // Update Cleaner Static Texts if View Rendered
  const cleanerHeader = document.querySelector('.cleaner-header h2')
  if (cleanerHeader) cleanerHeader.textContent = t.cleanerTitle
  
  // We can query specific headings if they don't have IDs by structure... risky.
  // Ideally cleaner.js should pull from a global config/lang provider.
  // For now, let's update what we can target by ID or specific attribute.

  // Modals
  safeTextContentSelector('#editModal .modal-header h3', t.modalEditTitle)
  safeTextContentSelector('label[for="editTitle"]', t.modalEditLabelTitle)
  safeTextContentSelector('label[for="editUrl"]', t.modalEditLabelUrl)
  safeTextContent('saveEdit', t.modalSave)
  safeTextContent('cancelEdit', t.modalCancel)
  
  safeTextContentSelector('#addFolderModal .modal-header h3', t.modalNewFolderTitle)
  safeTextContentSelector('label[for="newFolderTitle"]', t.modalNewFolderLabel)
  safeTextContent('createFolderBtn', t.modalCreate)
  safeTextContent('cancelAddFolder', t.modalCancel2)
  
  // Context Menus
  // We need to preserve SVGs inside... `textContent` kills children. 
  // We should update the TEXT NODE only.
  updateTextNode('menuClone', t.ctxClone)
  updateTextNode('menuOpenNewTab', t.ctxOpenTab)
  updateTextNode('menuEdit', t.ctxEdit)
  updateTextNode('menuDelete', t.ctxDelete)
  
  updateTextNode('cardMenuEdit', t.ctxEditName)
  updateTextNode('cardMenuNewFolder', t.ctxNewFolder)
  updateTextNode('cardMenuOpenAll', t.ctxOpenAll)
  updateTextNode('cardMenuDelete', t.ctxDelFolder)
  
  // Settings View (if open, it re-renders on open/change, so fine)
}

// Helper to update text but keep SVG icons
function updateTextNode(id, newText) {
  const el = document.getElementById(id)
  if (!el) return
  
  // Find text node
  let textNode = null
  for (let node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      textNode = node
      break
    }
  }
  
  if (textNode) {
    textNode.textContent = newText.startsWith(' ') ? newText : ' ' + newText // Keep spacing
  } else {
    // If no text node found (maybe purely icon initially?), append one?
    // Current HTML has text.
    // If we can't find it, we might be appending.
    el.appendChild(document.createTextNode(' ' + newText))
  }
}

function safeTextContent(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

function safeTextContentSelector(sel, text) {
  const el = document.querySelector(sel)
  if (el) el.textContent = text
}

function safeTitle(id, text) {
  const el = document.getElementById(id)
  if (el) el.title = text
}

// Expose T for other modules if needed
export function getTranslation(key) {
  const t = I18N[currentConfig.language] || I18N.es
  return t[key] || key
}

export function initSettings() {
  const btn = document.getElementById('settingsBtn')
  const container = document.getElementById('settingsView')
  
  // Set initial transition style
  container.style.opacity = '0'
  container.style.transition = 'opacity 0.2s ease-in-out'

  // Load config on startup
  loadConfig().then(() => {
    applyConfig()
    applyTranslations() // Initial translation
  })

  // Toggle View Logic
  btn.addEventListener('click', () => {
    // Check purely by display property for robust toggle
    const isShowing = container.style.display !== 'none'
    
    if (isShowing) {
      closeSettings()
    } else {
      openSettings()
    }
  })
}

function openSettings() {
  const container = document.getElementById('settingsView')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const searchContainer = document.getElementById('searchResults')
  const cleanerContainer = document.getElementById('cleanerView')
  const dashboardContainer = document.getElementById('recentTopList')
  const btn = document.getElementById('settingsBtn')
  
  // Identify Visible View
  const views = [bookmarkContainer, searchContainer, cleanerContainer, dashboardContainer]
  const visibleView = views.find(v => v.style.display !== 'none' && v.style.opacity !== '0')

  // Render UI before showing
  renderSettingsUI()
  
  if (visibleView) {
    fadeOut(visibleView, () => {
      visibleView.style.display = 'none'
      container.style.display = 'block'
      container.style.opacity = '0'
      requestAnimationFrame(() => fadeIn(container))
    })
  } else {
    container.style.display = 'block'
    container.style.opacity = '0'
    requestAnimationFrame(() => fadeIn(container))
  }
  
  // Update button state if needed (active background)
  btn.style.background = 'rgba(0,0,0,0.1)'
  
  // Reset other buttons
  const recentsBtn = document.getElementById('toggleRecentsBtn')
  if (recentsBtn) recentsBtn.style.background = ''
  
  // Also hide +Folder button in Settings view? Yes
  const addFolderBtn = document.getElementById('addFolderBtn')
  if (addFolderBtn) addFolderBtn.style.display = 'none'
}

export function closeSettings() {
  const container = document.getElementById('settingsView')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const btn = document.getElementById('settingsBtn')
  const addFolderBtn = document.getElementById('addFolderBtn')

  fadeOut(container, () => {
    container.style.display = 'none'
    bookmarkContainer.style.display = 'block'
    requestAnimationFrame(() => fadeIn(bookmarkContainer))
    
    // Show add folder btn again
    if (addFolderBtn) addFolderBtn.style.display = 'flex'
  })
  
  btn.style.background = ''
}

function renderSettingsUI() {
  const container = document.getElementById('settingsView')
  const t = I18N[currentConfig.language] || I18N.es
  
  container.innerHTML = `
    <div class="settings-header">
      <h2>${t.settingsTitle}</h2>
      <button id="closeSettingsBtn" class="close-btn" style="font-size: 24px;">&times;</button>
    </div>
    
    <div class="settings-section">
      <h3>${t.general}</h3>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.showRecents}</span>
          <span class="setting-desc">${t.showRecentsDesc}</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggleRecentsSetting" ${currentConfig.showRecentTop ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.showCleaner}</span>
          <span class="setting-desc">${t.showCleanerDesc}</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggleCleanerSetting" ${currentConfig.showCleaner ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

    </div>

    <div class="settings-section">
      <h3>${t.appearance}</h3>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.theme}</span>
        </div>
        <select id="themeSelect" class="select-control">
          <option value="light" ${currentConfig.theme === 'light' ? 'selected' : ''}>${t.themeLight}</option>
          <option value="dark" ${currentConfig.theme === 'dark' ? 'selected' : ''}>${t.themeDark}</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <h3>${t.language}</h3>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.selectLang}</span>
        </div>
        <select id="langSelect" class="select-control">
          <option value="es" ${currentConfig.language === 'es' ? 'selected' : ''}>Español</option>
          <option value="en" ${currentConfig.language === 'en' ? 'selected' : ''}>English</option>
          <option value="ca" ${currentConfig.language === 'ca' ? 'selected' : ''}>Català</option>
        </select>
      </div>
    </div>
  `
  
  // Attach Listeners
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings)
  
  document.getElementById('toggleRecentsSetting').addEventListener('change', (e) => {
    updateConfig('showRecentTop', e.target.checked)
  })
  
  document.getElementById('toggleCleanerSetting').addEventListener('change', (e) => {
    updateConfig('showCleaner', e.target.checked)
  })
  
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    updateConfig('theme', e.target.value)
  })
  
  document.getElementById('langSelect').addEventListener('change', (e) => {
    updateConfig('language', e.target.value)
    // Re-render immediately to show language change
    renderSettingsUI()
    applyTranslations()
  })
}

function updateConfig(key, value) {
  currentConfig[key] = value
  saveConfig()
  applyConfig()
}

function saveConfig() {
  if (chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ copdullConfig: currentConfig })
  } else {
    localStorage.setItem('copdullConfig', JSON.stringify(currentConfig))
  }
}

function loadConfig() {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['copdullConfig'], (result) => {
        if (result.copdullConfig) {
          currentConfig = { ...DEFAULT_CONFIG, ...result.copdullConfig }
        }
        resolve()
      })
    } else {
      const stored = localStorage.getItem('copdullConfig')
      if (stored) {
        currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
      }
      resolve()
    }
  })
}

function applyConfig() {
  // Apply Visibility
  const recentsBtn = document.getElementById('toggleRecentsBtn')
  if (recentsBtn) {
    recentsBtn.style.display = currentConfig.showRecentTop ? 'flex' : 'none'
  }
  
  const cleanerBtn = document.getElementById('cleanerBtn')
  if (cleanerBtn) {
    cleanerBtn.style.display = currentConfig.showCleaner ? 'flex' : 'none'
  }
  
  // Apply Theme
  // Simple Theme Logic: toggle a class on body
  document.body.classList.remove('theme-dark', 'theme-light')
  document.body.classList.add(`theme-${currentConfig.theme}`)
  
  if (currentConfig.theme === 'dark') {
      applyDarkTheme()
  } else {
      removeDarkTheme()
  }
}

// Minimal Dark Theme Injection (Better done via CSS variables usually, but injecting for now)
function applyDarkTheme() {
    // Check if stylesheet exists
    let style = document.getElementById('dark-theme-style')
    if (!style) {
        style = document.createElement('style')
        style.id = 'dark-theme-style'
        style.textContent = `
          body.theme-dark { background-color: #202124; color: #e8eaed; }
          body.theme-dark header { background-color: #202124; border-color: #3f4042; mask-image: none; }
          
          /* Cards */
          body.theme-dark .card { background-image: none;background-color: #292a2d; color: #e8eaed; border-color: #3f4042; box-shadow: none; }
          body.theme-dark .card-header { border-bottom: 1px solid #3f4042; background: #202124; }
          body.theme-dark .card-header .title .name { color: #e8eaed; }
          
          /* Folders & Links within Cards */
          body.theme-dark .folder { background: #292a2d; color: #e8eaed; }
          body.theme-dark .folder-title { color: #e8eaed; }
          
          body.theme-dark .link { color: #e8eaed; }
          body.theme-dark .link:last-child { border-bottom: none; }
          
          body.theme-dark .folder:hover, body.theme-dark .link:hover { background-color: #3c4043; }
          
          body.theme-dark .link a { color: #e8eaed; text-decoration: none; }
          body.theme-dark .link a:hover { color: #8ab4f8; }
          
          /* SVGs */
          body.theme-dark svg { fill: #9aa0a6; stroke: #9aa0a6; }
          body.theme-dark #searchInput { background-color: #202124; color: #e8eaed; border-color: #3f4042; outline: none; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
          body.theme-dark .header-btn { background-color: #202124; color: #e8eaed; border-color: #3f4042; outline: none; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
          body.theme-dark .header-btn svg { stroke: #9aa0a6; fill: none; }
          body.theme-dark .back-button svg { fill: #9aa0a6; }
          
          /* Views */
          body.theme-dark .cleaner-view, body.theme-dark .settings-view { background-color: #292a2d; color: #e8eaed; }
          body.theme-dark .cleaner-header, body.theme-dark .settings-header { border-bottom-color: #3f4042; }
          body.theme-dark .cleaner-list, body.theme-dark .setting-item { border-color: #3f4042; }
          body.theme-dark .cleaner-item:hover, body.theme-dark .rt-item:hover { background-color: #35363a; }
          body.theme-dark .cleaner-item, body.theme-dark .rt-item { color: #e8eaed; }
          
          /* Sections */
          body.theme-dark .settings-section h3, body.theme-dark .cleaner-section h3 { color: #9aa0a6; }
          body.theme-dark .setting-label { color: #e8eaed; }
          body.theme-dark .setting-desc { color: #9aa0a6; }
          body.theme-dark .rt-section { background: #292a2d; color: #e8eaed; border: 1px solid #3f4042; }
          body.theme-dark .rt-header { color: #e8eaed; border-bottom-color: #3f4042; }
          
          /* Inputs & UI */
          body.theme-dark .select-control, body.theme-dark .form-control { background-color: #35363a; color: #e8eaed; border-color: #5f6368; }
          body.theme-dark .modal { background: #292a2d; color: #e8eaed; border: 1px solid #5f6368; }
          body.theme-dark .modal-header { border-bottom-color: #3f4042; }
          body.theme-dark .context-menu { background: #292a2d; border-color: #5f6368; }
          body.theme-dark .menu-item { color: #e8eaed; }
          body.theme-dark .menu-item:hover { background: #35363a; }
          body.theme-dark .menu-separator { background: #3f4042; }
          body.theme-dark input[type="text"], body.theme-dark input[type="search"] { background: #35363a; color: #e8eaed; border-color: #5f6368; }
          
          /* Specific overrides for cleaner icons if needed */
          body.theme-dark .cleaner-actions .btn-primary { background-color: #8ab4f8; color: #202124; border: none; }
          body.theme-dark .cleaner-actions .btn-primary:disabled { background-color: #3f4042; color: #5f6368; }
        `
        document.head.appendChild(style)
    }
}

function removeDarkTheme() {
    const style = document.getElementById('dark-theme-style')
    if (style) style.remove()
}
