import { flattenBookmarks, fadeIn, fadeOut } from './search.js'

export function initCleaner() {
  const btn = document.getElementById('cleanerBtn')
  const cleanerContainer = document.getElementById('cleanerView')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const searchContainer = document.getElementById('searchResults')
  const dashboardContainer = document.getElementById('recentTopList')
  
  // Initial style
  cleanerContainer.style.opacity = '0'
  cleanerContainer.style.transition = 'opacity 0.2s ease-in-out'

  btn.addEventListener('click', () => {
    // Hide others
    const views = [bookmarkContainer, searchContainer, dashboardContainer]
    const visibleView = views.find(v => v.style.display !== 'none' && v.style.opacity !== '0')

    // Reset Dashboard Button State if it was active
    const dashboardBtn = document.getElementById('toggleRecentsBtn')
    if (dashboardBtn) dashboardBtn.style.background = ''

    if (visibleView) {
      fadeOut(visibleView, () => {
        visibleView.style.display = 'none'
        showCleaner()
      })
    } else if (cleanerContainer.style.display !== 'none' && cleanerContainer.style.opacity !== '0') {
      // Toggle off if already showing
      closeCleaner()
    } else {
      showCleaner()
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
      <h2>Limpieza de Marcadores</h2>
      <button class="close-btn" id="closeCleanerBtn">&times;</button>
    </div>

    <div class="cleaner-section">
      <h3>Marcadores Duplicados (<span id="dupCount">0</span>)</h3>
      <div class="cleaner-list" id="dupList">
        <div class="cleaner-empty">Analizando...</div>
      </div>
    </div>

    <div class="cleaner-section">
      <h3>Carpetas Vacías (<span id="emptyCount">0</span>)</h3>
      <div class="cleaner-list" id="emptyFolderList">
        <div class="cleaner-empty">Analizando...</div>
      </div>
    </div>

    <div class="cleaner-actions">
      <button id="cleanerDeleteBtn" class="btn btn-primary" disabled>Eliminar Seleccionados</button>
    </div>
  `
  
  document.getElementById('closeCleanerBtn').addEventListener('click', () => {
    // We need to access closeCleaner from init scope or reproduce logic.
    // Easier to trigger click on main button or just reproduce hiding logic.
    // Let's reproduce hiding logic effectively:
    const cleanerContainer = document.getElementById('cleanerView')
    const bookmarkContainer = document.getElementById('bookmarkList')
    
    fadeOut(cleanerContainer, () => {
      cleanerContainer.style.display = 'none'
      bookmarkContainer.style.display = 'block'
      requestAnimationFrame(() => fadeIn(bookmarkContainer))
    })
  })
  
  const deleteBtn = document.getElementById('cleanerDeleteBtn')
  deleteBtn.addEventListener('click', executeDelete)
}

function analyzeBookmarks() {
  chrome.bookmarks.getTree((nodes) => {
    const allItems = flattenBookmarks(nodes[0], '')
    
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
    container.innerHTML = '<div class="cleaner-empty">No se encontraron duplicados.</div>'
    return
  }
  
  duplicates.forEach(group => {
    // Header for the group (URL)
    const header = document.createElement('div')
    header.style.padding = '5px'
    header.style.fontWeight = 'bold'
    header.style.fontSize = '12px'
    header.style.background = '#fafafa'
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
    container.innerHTML = '<div class="cleaner-empty">No se encontraron carpetas vacías.</div>'
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
  if (checked.length > 0) {
    btn.textContent = `Eliminar Seleccionados (${checked.length})`
  } else {
    btn.textContent = 'Eliminar Seleccionados'
  }
}

function executeDelete() {
  const checked = document.querySelectorAll('.cleaner-view input[type="checkbox"]:checked')
  if (checked.length === 0) return
  
  if (!confirm(`¿Estás seguro de que quieres eliminar ${checked.length} elementos permanentemente?`)) {
    return
  }
  
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
        alert('Limpieza completada.')
        window.location.reload()
      }
    })
  })
}
