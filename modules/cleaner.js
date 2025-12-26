import { flattenBookmarks, fadeIn, fadeOut } from './search.js'
import { getTranslation } from './settings.js'

export function initCleaner() {
  const btn = document.getElementById('cleanerBtn')
  const cleanerContainer = document.getElementById('cleanerView')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const searchContainer = document.getElementById('searchResults')
  const dashboardContainer = document.getElementById('recentTopList')
  
  // Initial style
  cleanerContainer.style.opacity = '0'
  cleanerContainer.style.transition = 'opacity 0.2s ease-in-out'

  const addFolderBtn = document.getElementById('addFolderBtn')

  btn.addEventListener('click', () => {
    // Hide others
    const views = [bookmarkContainer, searchContainer, dashboardContainer, document.getElementById('settingsView')]
    const visibleView = views.find(v => v && v.style.display !== 'none' && v.style.opacity !== '0')

    // Reset Dashboard Button State if it was active
    const dashboardBtn = document.getElementById('toggleRecentsBtn')
    if (dashboardBtn) dashboardBtn.style.background = ''

    // Reset Settings Button State
    const settingsBtn = document.getElementById('settingsBtn')
    if (settingsBtn) settingsBtn.style.background = ''

    if (visibleView) {
      fadeOut(visibleView, () => {
        visibleView.style.display = 'none'
        showCleaner()
      })
      if (addFolderBtn) addFolderBtn.style.display = 'none'
    } else if (cleanerContainer.style.display !== 'none' && cleanerContainer.style.opacity !== '0') {
      // Toggle off if already showing
      closeCleaner()
    } else {
      showCleaner()
      if (addFolderBtn) addFolderBtn.style.display = 'none'
    }
  })

  function showCleaner() {
    cleanerContainer.style.display = 'block'
    
    renderCleanerStructure(cleanerContainer)
    analyzeBookmarks(cleanerContainer)
    
    requestAnimationFrame(() => {
      fadeIn(cleanerContainer)
    })
  }
  
  function closeCleaner() {
    const addFolderBtn = document.getElementById('addFolderBtn')
    if (addFolderBtn) addFolderBtn.style.display = 'flex'

    fadeOut(cleanerContainer, () => {
      cleanerContainer.style.display = 'none'
      bookmarkContainer.style.display = 'block'
      requestAnimationFrame(() => fadeIn(bookmarkContainer))
    })
  }
}

function renderCleanerStructure(container) {
  container.innerHTML = `
    <div class="cleaner-header">
      <h2>${getTranslation('cleanerTitle')}</h2>
      <button class="close-btn" id="closeCleanerBtn">&times;</button>
    </div>

    <div class="cleaner-section">
      <h3>${getTranslation('cleanerDuplicates')} (<span id="dupCount">0</span>)</h3>
      <div class="cleaner-list" id="dupList">
        <div class="cleaner-empty">${getTranslation('cleanerAnalysing')}</div>
      </div>
    </div>

    <div class="cleaner-section">
      <h3>${getTranslation('cleanerEmptyFolders')} (<span id="emptyCount">0</span>)</h3>
      <div class="cleaner-list" id="emptyFolderList">
        <div class="cleaner-empty">${getTranslation('cleanerAnalysing')}</div>
      </div>
    </div>

    <div class="cleaner-section">
      <div style="display: flex; justify-content: space-between; align-items: center;">
         <h3>${getTranslation('cleanerBrokenLinks')} (<span id="brokenCount">0</span>)</h3>
         <button id="scanBrokenBtn" class="btn btn-secondary" style="padding: 2px 8px; font-size: 11px;">${getTranslation('cleanerScan')}</button>
      </div>
      <div style="font-size: 11px; color: #666; margin-bottom: 5px;" id="scanStatus"></div>
      <div class="cleaner-list" id="brokenList">
        <div class="cleaner-empty">${getTranslation('cleanerScanMsg')}</div>
      </div>
    </div>

    <div class="cleaner-actions">
      <button id="cleanerDeleteBtn" class="btn btn-primary" disabled>${getTranslation('cleanerDeleteSelected')}</button>
    </div>
  `
  
  document.getElementById('closeCleanerBtn').addEventListener('click', () => {
    // We need to access closeCleaner from init scope or reproduce logic.
    const cleanerContainer = document.getElementById('cleanerView')
    const bookmarkContainer = document.getElementById('bookmarkList')
    const addFolderBtn = document.getElementById('addFolderBtn')

    if (addFolderBtn) addFolderBtn.style.display = 'flex'
    
    fadeOut(cleanerContainer, () => {
      cleanerContainer.style.display = 'none'
      bookmarkContainer.style.display = 'block'
      requestAnimationFrame(() => fadeIn(bookmarkContainer))
    })
  })
  
  const deleteBtn = document.getElementById('cleanerDeleteBtn')
  deleteBtn.addEventListener('click', executeDelete)
  
  document.getElementById('scanBrokenBtn').addEventListener('click', () => startBrokenLinkScan())
}

let allBookmarksCache = []

function analyzeBookmarks() {
  chrome.bookmarks.getTree((nodes) => {
    const allItems = flattenBookmarks(nodes[0], '')
    allBookmarksCache = allItems
    
    // Find Duplicates
    const urlMap = {}
    allItems.forEach(item => {
      if (!urlMap[item.url]) urlMap[item.url] = []
      urlMap[item.url].push(item)
    })
    
    const duplicates = []
    Object.values(urlMap).forEach(group => {
      if (group.length > 1) {
        duplicates.push(group)
      }
    })
    
    renderDuplicates(duplicates)
    
    // Find Empty Folders
    const emptyFolders = []
    findEmptyFoldersRecursive(nodes[0], '', emptyFolders)
    
    renderEmptyFolders(emptyFolders)
    
    updateDeleteButtonState()
  })
}

function findEmptyFoldersRecursive(node, path, resultList) {
  if (node.children) {
    // Check if empty
    // Root folders (0, 1, 2 typically) shouldn't be deleted usually unless empty user folders?
    // Node 0 is root. Node 1 is "Bookmark Bar". Node 2 is "Other Bookmarks".
    // We should probably safeguard against deleting root nodes even if empty.
    // Usually user created folders have higher IDs or are children of these.
    // We can just check `parentId`.
    
    const isRoot = node.id === '0' || node.parentId === '0' 
    
    if (!isRoot && node.children.length === 0) {
      resultList.push({
        id: node.id,
        title: node.title,
        path: path ? `${path} > ${node.title}` : node.title
      })
    }
    
    const newPath = node.title ? (path ? `${path} > ${node.title}` : node.title) : path
    node.children.forEach(child => findEmptyFoldersRecursive(child, newPath, resultList))
  }
}

function renderDuplicates(duplicates) {
  const container = document.getElementById('dupList')
  const countSpan = document.getElementById('dupCount')
  
  countSpan.textContent = duplicates.reduce((acc, group) => acc + group.length, 0)
  container.innerHTML = ''
  
  if (duplicates.length === 0) {
    container.innerHTML = `<div class="cleaner-empty">${getTranslation('cleanerEmptyMsg')}</div>`
    return
  }
  
  duplicates.forEach(group => {
    // Header for the group (URL)
    const header = document.createElement('div')
    header.style.padding = '5px'
    header.style.fontWeight = 'bold'
    header.style.fontSize = '12px'
    header.style.background = '#fafafa28'
    header.textContent = group[0].url
    container.appendChild(header)
    
    group.forEach(item => {
      const div = document.createElement('div')
      div.className = 'cleaner-item'
      
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.value = item.id
      checkbox.dataset.type = 'bookmark'
      checkbox.addEventListener('change', updateDeleteButtonState)
      
      const img = document.createElement('img')
      img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${item.url}`
      img.style.width = '16px'
      img.style.height = '16px'
      
      const title = document.createElement('span')
      title.textContent = item.title
      
      const path = document.createElement('span')
      path.className = 'path'
      path.textContent = item.path
      
      div.appendChild(checkbox)
      div.appendChild(img)
      div.appendChild(title)
      div.appendChild(path)
      
      container.appendChild(div)
    })
  })
}

function renderEmptyFolders(folders) {
  const container = document.getElementById('emptyFolderList')
  const countSpan = document.getElementById('emptyCount')
  
  countSpan.textContent = folders.length
  container.innerHTML = ''
  
  if (folders.length === 0) {
    container.innerHTML = `<div class="cleaner-empty">${getTranslation('cleanerEmptyMsg')}</div>`
    return
  }
  
  folders.forEach(folder => {
      const div = document.createElement('div')
      div.className = 'cleaner-item'
      
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.value = folder.id
      checkbox.dataset.type = 'folder'
      checkbox.addEventListener('change', updateDeleteButtonState)
      
      const icon = document.createElement('span')
      icon.innerHTML = '📁'
      
      const title = document.createElement('span')
      title.textContent = folder.title
      
      const path = document.createElement('span')
      path.className = 'path'
      path.textContent = folder.path
      
      div.appendChild(checkbox)
      div.appendChild(icon)
      div.appendChild(title)
      div.appendChild(path)
      
      container.appendChild(div)
  })
}

function updateDeleteButtonState() {
  const checked = document.querySelectorAll('.cleaner-view input[type="checkbox"]:checked')
  const btn = document.getElementById('cleanerDeleteBtn')
  btn.disabled = checked.length === 0
  const baseText = getTranslation('cleanerDeleteSelected')
  if (checked.length > 0) {
    btn.textContent = `${baseText} (${checked.length})`
  } else {
    btn.textContent = baseText
  }
}

import { showConfirmModal, showInfoModal } from './modal.js'

function executeDelete() {
  const checked = document.querySelectorAll('.cleaner-view input[type="checkbox"]:checked')
  if (checked.length === 0) return
  
  const msg = `${getTranslation('msgConfirmDelete')} (${checked.length})`
  
  showConfirmModal(getTranslation('modalConfirmTitle'), msg, () => {
      let processed = 0
      
      checked.forEach(input => {
        const id = input.value
        const type = input.dataset.type
        
        const removeFn = type === 'folder' 
          ? chrome.bookmarks.removeTree 
          : chrome.bookmarks.remove
          
        removeFn(id, () => {
          processed++
          if (processed === checked.length) {
            showInfoModal(getTranslation('modalInfoTitle'), getTranslation('msgCleanerCompleted'), () => {
                window.location.reload()
            })
          }
        })
      })
  })
}

async function startBrokenLinkScan() {
  const btn = document.getElementById('scanBrokenBtn')
  const statusDiv = document.getElementById('scanStatus')
  const listContainer = document.getElementById('brokenList')
  const countSpan = document.getElementById('brokenCount')
  
  if (allBookmarksCache.length === 0) {
      statusDiv.textContent = 'No hay marcadores para escanear.'
      return
  }

  btn.disabled = true
  listContainer.innerHTML = ''
  
  const uniqueUrls = [...new Set(allBookmarksCache.map(b => b.url).filter(u => u && (u.startsWith('http') || u.startsWith('https'))))]
  
  let checked = 0
  let broken = []
  
  statusDiv.textContent = `Escaneando ${uniqueUrls.length} URLs...`
  
  // Concurrency Limiter
  const LIMIT = 5
  const results = []
  
  for (let i = 0; i < uniqueUrls.length; i += LIMIT) {
      const chunk = uniqueUrls.slice(i, i + LIMIT)
      const promises = chunk.map(url => checkUrl(url))
      
      const chunkResults = await Promise.all(promises)
      results.push(...chunkResults)
      
      checked += chunk.length
      statusDiv.textContent = `Escaneando: ${checked} / ${uniqueUrls.length}`
  }
  
  // Filter broken
  const brokenResults = results.filter(r => !r.ok)
  
  // Map back to bookmarks
  const brokenBookmarks = []
  brokenResults.forEach(res => {
     // Find all bookmarks with this URL
     const matches = allBookmarksCache.filter(b => b.url === res.url)
     matches.forEach(m => {
         brokenBookmarks.push({
             ...m,
             reason: res.reason
         })
     })
  })
  
  statusDiv.textContent = `Escaneo completado. ${brokenBookmarks.length} enlaces rotos encontrados.`
  btn.disabled = false
  countSpan.textContent = brokenBookmarks.length
  
  renderBrokenLinks(brokenBookmarks)
}

async function checkUrl(url) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    try {
        // Try HEAD first
        const response = await fetch(url, { 
            method: 'HEAD', 
            signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
             // Retry with GET if Method Not Allowed (405) or Forbidden (403) which sometimes blocks HEAD
             if (response.status === 405 || response.status === 403) {
                 return await checkUrlGet(url)
             }
             return { url, ok: false, reason: `Status ${response.status}` }
        }
        return { url, ok: true }
    } catch (err) {
        clearTimeout(timeoutId)
        // If HEAD failed (network), try GET just in case (e.g. some servers reset connection on HEAD)
        return await checkUrlGet(url)
    }
}

async function checkUrlGet(url) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
        const response = await fetch(url, { method: 'GET', signal: controller.signal })
        clearTimeout(timeoutId)
        if (!response.ok) return { url, ok: false, reason: `Status ${response.status}` }
        return { url, ok: true }
    } catch(e) {
        clearTimeout(timeoutId)
        return { url, ok: false, reason: 'Unreachable' }
    }
}

function renderBrokenLinks(items) {
  const container = document.getElementById('brokenList')
  container.innerHTML = ''
  
  if (items.length === 0) {
      container.innerHTML = `<div class="cleaner-empty">${getTranslation('cleanerEmptyMsg')}</div>`
      return
  }
  
  items.forEach(item => {
      const div = document.createElement('div')
      div.className = 'cleaner-item'
      
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.value = item.id
      checkbox.dataset.type = 'bookmark'
      checkbox.addEventListener('change', updateDeleteButtonState)
      
      const img = document.createElement('img')
      img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${item.url}`
      img.style.width = '16px'
      img.style.height = '16px'
      
      const details = document.createElement('div')
      details.style.display = 'flex'
      details.style.flexDirection = 'column'
      details.style.overflow = 'hidden'
      
      const title = document.createElement('span')
      title.textContent = item.title
      
      const reason = document.createElement('span')
      reason.style.fontSize = '10px'
      reason.style.color = '#d93025'
      reason.textContent = `${item.reason} - ${item.url}`
      
      details.appendChild(title)
      details.appendChild(reason)

      const path = document.createElement('span')
      path.className = 'path'
      path.textContent = item.path
      
      div.appendChild(checkbox)
      div.appendChild(img)
      div.appendChild(details)
      div.appendChild(path)
      
      container.appendChild(div)
  })
}
