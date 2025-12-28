
import { fadeIn, fadeOut } from './nav.js'
import { I18N } from '../i18n/translations.js'

// Default Configuration
const DEFAULT_CONFIG = {
  theme: 'light',
  language: 'es',
  showRecentTop: true,
  showCleaner: true,
  showApps: false, // Aunque apps.js está desactivado, lo preparamos
  enableSync: false,
  folderColor: '#85b9ea'
}

let currentConfig = { ...DEFAULT_CONFIG }

// ... initSettings existente ...
export function applyTranslations() {
  const t = I18N[currentConfig.language] || I18N.es
  
  // Modales genéricos
  safeTextContent('confirmTitle', t.modalConfirmTitle)
  safeTextContent('infoTitle', t.modalInfoTitle)
  safeTextContent('confirmOkBtn', t.modalAccept)
  safeTextContent('confirmCancelBtn', t.modalCancelGeneric)
  safeTextContent('infoOkBtn', t.modalAccept)

  // ... resto de la función ...
  safeTextContent('toggleRecentsBtn', t.recentsBtn)
  safeTextContent('cleanerBtn', t.cleanBtn)
  safeTitle('toggleRecentsBtn', t.recentsBtn)
  safeTitle('cleanerBtn', t.cleanBtn)
  safeTitle('addFolderBtn', t.addFolderTitle)
  safeTitle('settingsBtn', t.settingsTitleBtn)
  
  const searchInput = document.getElementById('searchInput')
  if (searchInput) searchInput.placeholder = t.searchPlaceholder

  safeTextContent('dupCount', '0') 
  
  const cleanerHeader = document.querySelector('.cleaner-header h2')
  if (cleanerHeader) cleanerHeader.textContent = t.cleanerTitle

  safeTextContentSelector('#editModal .modal-header h3', t.modalEditTitle)
  safeTextContentSelector('label[for="editTitle"]', t.modalEditLabelTitle)
  safeTextContentSelector('label[for="editUrl"]', t.modalEditLabelUrl)
  safeTextContent('saveEdit', t.modalSave)
  safeTextContent('cancelEdit', t.modalCancel)
  
  safeTextContentSelector('#addFolderModal .modal-header h3', t.modalNewFolderTitle)
  safeTextContentSelector('label[for="newFolderTitle"]', t.modalNewFolderLabel)
  safeTextContent('createFolderBtn', t.modalCreate)
  safeTextContent('cancelAddFolder', t.modalCancel2)
  
  updateTextNode('menuClone', t.ctxClone)
  updateTextNode('menuOpenNewTab', t.ctxOpenTab)
  updateTextNode('menuEdit', t.ctxEdit)
  updateTextNode('menuDelete', t.ctxDelete)
  
  updateTextNode('cardMenuEdit', t.ctxEditName)
  updateTextNode('cardMenuNewFolder', t.ctxNewFolder)
  updateTextNode('cardMenuOpenAll', t.ctxOpenAll)
  updateTextNode('cardMenuDelete', t.ctxDelFolder)
}

function updateTextNode(id, newText) {
  const el = document.getElementById(id)
  if (!el) return
  
  let textNode = null
  for (let node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      textNode = node
      break
    }
  }
  
  if (textNode) {
    textNode.textContent = newText.startsWith(' ') ? newText : ' ' + newText
  } else {
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

export function getTranslation(key) {
  const t = I18N[currentConfig.language] || I18N.es
  return t[key] || key
}

export function initSettings() {
  const btn = document.getElementById('settingsBtn')
  const container = document.getElementById('settingsView')
  
  container.style.opacity = '0'
  container.style.transition = 'opacity 0.2s ease-in-out'

  const loadPromise = loadConfig().then(() => {
    // Sync the exported variable with the loaded config
    folderColor = currentConfig.folderColor
    applyConfig()
    applyTranslations()
  })

  btn.addEventListener('click', () => {
    const isShowing = container.style.display !== 'none'
    
    if (isShowing) {
      closeSettings()
    } else {
      openSettings()
    }
  })

  return loadPromise
}

export let folderColor = currentConfig.folderColor

function openSettings() {
  const container = document.getElementById('settingsView')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const searchContainer = document.getElementById('searchResults')
  const cleanerContainer = document.getElementById('cleanerView')
  const dashboardContainer = document.getElementById('recentTopList')
  const btn = document.getElementById('settingsBtn')
  
  const views = [bookmarkContainer, searchContainer, cleanerContainer, dashboardContainer]
  const visibleView = views.find(v => v.style.display !== 'none' && v.style.opacity !== '0')

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
  
  btn.style.background = 'rgba(0,0,0,0.1)'
  
  const recentsBtn = document.getElementById('toggleRecentsBtn')
  if (recentsBtn) recentsBtn.style.background = ''
  
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
    requestAnimationFrame(() => fadeIn(container)) // This was weird in older code maybe? fadeIn(bookmarkContainer)
    
    requestAnimationFrame(() => fadeIn(bookmarkContainer))

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
      <h3>${t.syncSection}</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.enableSync}</span>
          <span class="setting-desc">${t.enableSyncDesc}</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggleSyncSetting" ${currentConfig.enableSync ? 'checked' : ''}>
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

      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">${t.folderColor}</span>
          <span class="setting-desc">${t.folderColorDesc}</span>
        </div>
 
        <input type="color" id="folderColorSetting" value="${currentConfig.folderColor}">
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

  document.getElementById('toggleSyncSetting').addEventListener('change', (e) => {
    updateConfig('enableSync', e.target.checked)
  })
  
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    updateConfig('theme', e.target.value)
  })
  
  document.getElementById('langSelect').addEventListener('change', (e) => {
    updateConfig('language', e.target.value)
    renderSettingsUI()
    applyTranslations()
  })

  document.getElementById('folderColorSetting').addEventListener('change', (e) => {
    updateConfig('folderColor', e.target.value)
  })
}

function updateConfig(key, value) {
  currentConfig[key] = value
  if (key === 'folderColor') folderColor = value
  saveConfig()
  applyConfig()
}

function saveConfig() {
  // Always save to local to keep 'enableSync' preference persistent locally
  localStorage.setItem('copdullConfig', JSON.stringify(currentConfig))

  // If sync is enabled, also save to cloud
  if (currentConfig.enableSync && chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ copdullConfig: currentConfig })
  }
}

function loadConfig() {
  return new Promise((resolve) => {
    // 1. Load Local
    const stored = localStorage.getItem('copdullConfig')
    let localConfig = {}
    
    if (stored) {
      localConfig = JSON.parse(stored)
    }

    // Default 'enableSync' is true in DEFAULT_CONFIG, but let's check local override
    // If never saved, it uses default.
    const mergedLocal = { ...DEFAULT_CONFIG, ...localConfig }
    
    // 2. Check Sync if enabled
    if (mergedLocal.enableSync && chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['copdullConfig'], (result) => {
        if (result.copdullConfig) {
          // Merge: Default < Local < Sync (Sync wins if enabled?)
          // actually if user enabled sync, we trust sync data.
          // BUT if sync is empty (first time), we might want to push local?
          // For now simplest: Sync overwrites Local if present.
          currentConfig = { ...mergedLocal, ...result.copdullConfig }
        } else {
          // First time syncing or empty
          currentConfig = mergedLocal
        }
        resolve()
      })
    } else {
      currentConfig = mergedLocal
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
  document.body.classList.remove('theme-dark', 'theme-light')
  document.body.classList.add(`theme-${currentConfig.theme}`)
  
  if (currentConfig.theme === 'dark') {
      applyDarkTheme()
  } else {
      removeDarkTheme()
  }

  // Apply visual updates: Folder Color
  const folderSvgs = document.querySelectorAll('.folder-title svg')
  folderSvgs.forEach(svg => {
     svg.setAttribute('fill', currentConfig.folderColor)
  })
}

// Inyección del Tema Oscuro
function applyDarkTheme() {
    let style = document.getElementById('dark-theme-style')
    if (!style) {
        style = document.createElement('style')
        style.id = 'dark-theme-style'
        style.textContent = `
          body.theme-dark { background: #202124; color: #e8eaed; }
          body.theme-dark header { background: #202124; border-color: #3f4042; }
          
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
          body.theme-dark svg { stroke: #9aa0a6; }
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
          body.theme-dark .modal-footer { background: #292a2d; border-top-color: #3f4042; }
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
