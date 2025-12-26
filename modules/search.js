export function initSearch() {
  const input = document.getElementById('searchInput')
  const resultsContainer = document.getElementById('searchResults')
  const bookmarksContainer = document.getElementById('bookmarkList')
  
  let allBookmarks = []

  // Ensure initial state
  resultsContainer.style.opacity = '0'
  resultsContainer.style.display = 'none'
  bookmarksContainer.style.opacity = '1'
  bookmarksContainer.style.transition = 'opacity 0.2s ease-in-out'
  resultsContainer.style.transition = 'opacity 0.2s ease-in-out'

  // 1. Fetch and Flatten Bookmarks
  chrome.bookmarks.getTree((nodes) => {
    allBookmarks = flattenBookmarks(nodes[0], '')
  })

  // 2. Event Listener
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim()
    const recentTopContainer = document.getElementById('recentTopList')
    const cleanerContainer = document.getElementById('cleanerView')
    const settingsContainer = document.getElementById('settingsView')
    const addFolderBtn = document.getElementById('addFolderBtn')

    if (query.length === 0) {
      if (resultsContainer.style.display !== 'none') {
        fadeOut(resultsContainer, () => {
          resultsContainer.style.display = 'none'
          bookmarksContainer.style.display = 'block'
          if (addFolderBtn) addFolderBtn.style.display = 'flex'
          // Small timeout to ensure display:block is applied before opacity transition
          requestAnimationFrame(() => {
            fadeIn(bookmarksContainer)
          })
        })
      } else {
         if (addFolderBtn) addFolderBtn.style.display = 'flex'
      }
      return
    }
    
    // Hide Add Folder Btn
    if (addFolderBtn) addFolderBtn.style.display = 'none'
    
    // Ensure other views are hidden
    const viewsToHide = [recentTopContainer, cleanerContainer, settingsContainer]
    
    viewsToHide.forEach(container => {
      // Check if container exists before checking style
      if (container && container.style.display !== 'none') {
        container.style.display = 'none'
        container.style.opacity = '0'
      }
    })
    
    // Also reset buttons active state if needed
    const settingsBtn = document.getElementById('settingsBtn')
    if (settingsBtn) settingsBtn.style.background = ''

    // Filter
    const matches = allBookmarks.filter(item => 
      item.title.toLowerCase().includes(query) || 
      (item.url && item.url.toLowerCase().includes(query))
    )

    // Render
    renderResults(matches, resultsContainer)

    if (bookmarksContainer.style.display !== 'none') {
      fadeOut(bookmarksContainer, () => {
        bookmarksContainer.style.display = 'none'
        resultsContainer.style.display = 'block'
        requestAnimationFrame(() => {
          fadeIn(resultsContainer)
        })
      })
    } else if (resultsContainer.style.display === 'none') {
      // If bookmarks was already hidden (e.g. from Dashboard view), just show results
      resultsContainer.style.display = 'block'
      requestAnimationFrame(() => {
        fadeIn(resultsContainer)
      })
    }
  })
}

export function fadeIn(element) {
  element.style.opacity = '1'
}

export function fadeOut(element, callback) {
  element.style.opacity = '0'
  if (callback) {
    element.addEventListener('transitionend', function handler() {
      element.removeEventListener('transitionend', handler)
      callback()
    }, { once: true })
  }
}

export function flattenBookmarks(node, path) {
  let items = []
  
  // Skip root level titles usually, or handle nicely. 
  // node 0 usually has children "Bookmarks Bar", "Other Bookmarks".
  
  if (node.children) {
    const newPath = node.title ? (path ? `${path} > ${node.title}` : node.title) : path
    node.children.forEach(child => {
      items = items.concat(flattenBookmarks(child, newPath))
    })
  } else if (node.url) {
    // It's a bookmark
    items.push({
      title: node.title,
      url: node.url,
      path: path,
      id: node.id
    })
  }
  
  return items
}

function renderResults(matches, container) {
  container.innerHTML = ''
  
  // Add a "Card Header" for the results
  const header = document.createElement('div')
  header.className = 'header-label'
  header.textContent = `Search Results (${matches.length})`
  container.appendChild(header)

  if (matches.length === 0) {
    const noResults = document.createElement('div')
    noResults.style.padding = '20px'
    noResults.style.textAlign = 'center'
    noResults.style.color = '#888'
    noResults.style.fontSize = '12px'
    noResults.textContent = 'No matches found'
    container.appendChild(noResults)
    return
  }

  matches.forEach(item => {
    const div = document.createElement('div')
    div.className = 'search-result-item'
    div.dataset.id = item.id
    
    const img = document.createElement('img')
    img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${item.url}`
    
    const a = document.createElement('a')
    a.href = item.url
    a.textContent = item.title
    
    const pathSpan = document.createElement('span')
    pathSpan.className = 'search-result-path'

    const paths = item.path.split('>')
    const parentPath = paths.slice(1, paths.length - 1).join(' > ')

    pathSpan.textContent = parentPath
    
    div.appendChild(img)
    div.appendChild(a)
    div.appendChild(pathSpan)
    
    // Make the whole row clickable
    div.addEventListener('click', (e) => {
        // Avoid double click if clicking the link directly
        if (e.target.tagName !== 'A') {
            window.location.href = item.url
        }
    })
    
    container.appendChild(div)
  })
}
