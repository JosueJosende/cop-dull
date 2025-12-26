
import { fadeIn, fadeOut } from './search.js'
import { getTranslation } from './settings.js'

export function initDashboard() {
  const dashboardContainer = document.getElementById('recentTopList')
  const bookmarkContainer = document.getElementById('bookmarkList')
  const searchContainer = document.getElementById('searchResults')
  const searchInput = document.getElementById('searchInput')
  const btn = document.getElementById('toggleRecentsBtn')
  
  const cleanerContainer = document.getElementById('cleanerView')
  // Set initial transition style for dashboard
  dashboardContainer.style.opacity = '0'
  dashboardContainer.style.transition = 'opacity 0.2s ease-in-out'
  
  const addFolderBtn = document.getElementById('addFolderBtn')

  btn.addEventListener('click', () => {
    // Check if we are currently showing dashboard
    const isShowing = dashboardContainer.style.display !== 'none' && dashboardContainer.style.opacity !== '0'

    if (isShowing) {
      // HIDE DASHBOARD
      fadeOut(dashboardContainer, () => {
          dashboardContainer.style.display = 'none'
          
          if (searchInput.value.trim() !== '') {
            searchContainer.style.display = 'block'
            requestAnimationFrame(() => fadeIn(searchContainer))
            // Search is active, keep button hidden
            if (addFolderBtn) addFolderBtn.style.display = 'none' 
        } else {
            bookmarkContainer.style.display = 'block'
            requestAnimationFrame(() => fadeIn(bookmarkContainer))
            // Main view, show button
            if (addFolderBtn) addFolderBtn.style.display = 'flex'
          }
      })
      
      btn.style.background = ''
    } else {
      // SHOW DASHBOARD
      
      // Hide Folder Button
      if (addFolderBtn) addFolderBtn.style.display = 'none'
      
      // Identify what is currently visible to fade it out
      const views = [bookmarkContainer, searchContainer, cleanerContainer, document.getElementById('settingsView')]
      const visibleView = views.find(v => v && v.style.display !== 'none' && v.style.opacity !== '0')
      
      const showDash = () => {
        renderDashboard(dashboardContainer)
        dashboardContainer.style.display = 'flex'
        
        requestAnimationFrame(() => {
          fadeIn(dashboardContainer)
        })
      }

      // Hide Settings Button active state if was active
      const settingsBtn = document.getElementById('settingsBtn')
      if (settingsBtn) settingsBtn.style.background = ''

      if (visibleView) {
        fadeOut(visibleView, () => {
          visibleView.style.display = 'none'
          showDash()
        })
      } else {
        // If nothing is visible (maybe mid-transition state or initial), just show
        showDash()
      }
    }
  })
}

function renderDashboard(container) {
  container.innerHTML = ''
  
  // 1. Top Sites Section
  const topSection = document.createElement('div')
  topSection.className = 'rt-section'
  topSection.innerHTML = `
    <div class="rt-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1a73e8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ${getTranslation('topSites')}
    </div>
    <div class="rt-list" id="topSitesList"></div>
  `
  container.appendChild(topSection)

  // 2. Recent Tabs Section
  const recentSection = document.createElement('div')
  recentSection.className = 'rt-section'
  recentSection.innerHTML = `
    <div class="rt-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1a73e8"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
      ${getTranslation('recentTabs')}
    </div>
    <div class="rt-list" id="recentTabsList"></div>
  `
  container.appendChild(recentSection)

  // Load Data
  loadTopSites()
  loadRecentTabs()
}

function loadTopSites() {
  chrome.topSites.get((data) => {
    const list = document.getElementById('topSitesList')
    if (!list) return
    
    data.slice(0, 10).forEach(site => {
      const item = createItem(site.title, site.url)
      list.appendChild(item)
    })
  })
}

function loadRecentTabs() {
  chrome.sessions.getRecentlyClosed({ maxResults: 10 }, (sessions) => {
    const list = document.getElementById('recentTabsList')
    if (!list) return

    sessions.forEach(session => {
      // Could be tab or window
      if (session.tab) {
        const item = createItem(session.tab.title, session.tab.url)
        list.appendChild(item)
      } else if (session.window) {
        // Maybe show window summary? For now just skip or show first tab
        // session.window.tabs
        const count = session.window.tabs.length
        const title = `${count} Tabs (Window)`
        // We can't really link to a "window restore" easily with a simple href, 
        // would need chrome.sessions.restore(session.sessionId).
        // Let's stick to clickable links for now or handle click.
        
        const div = document.createElement('div')
        div.className = 'rt-item'
        div.style.cursor = 'pointer'
        div.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#757575"><path d="M2 2h20v20H2V2zm2 2v16h16V4H4z"/></svg>
          <span>${count} Pestañas (Ventana cerrada)</span>
        `
        div.addEventListener('click', () => {
          chrome.sessions.restore(session.window.sessionId)
        })
        list.appendChild(div)
      }
    })
  })
}

function createItem(title, url) {
  const a = document.createElement('a')
  a.className = 'rt-item'
  a.href = url
  
  const img = document.createElement('img')
  // Use google favicon service
  img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${url}`
  
  const span = document.createElement('span')
  span.textContent = title || url
  
  a.appendChild(img)
  a.appendChild(span)
  
  return a
}
