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

    if (query.length === 0) {
      if (resultsContainer.style.display !== 'none') {
        fadeOut(resultsContainer, () => {
          resultsContainer.style.display = 'none'
          bookmarksContainer.style.display = 'block'
          // Small timeout to ensure display:block is applied before opacity transition
          requestAnimationFrame(() => {
             fadeIn(bookmarksContainer)
          })
        })
      }
      return
    }

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
    }
  })
}

function fadeIn(element) {
  element.style.opacity = '1'
}

function fadeOut(element, callback) {
  element.style.opacity = '0'
  if (callback) {
    element.addEventListener('transitionend', function handler() {
      element.removeEventListener('transitionend', handler)
      callback()
    }, { once: true })
  }
}

function flattenBookmarks(node, path) {
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
    pathSpan.textContent = item.path
    
    div.appendChild(img)
    div.appendChild(a)
    div.appendChild(pathSpan)
    
    // Make the whole row clickable
    div.addEventListener('click', () => {
      window.location.href = item.url
    })
    
    container.appendChild(div)
  })
}
