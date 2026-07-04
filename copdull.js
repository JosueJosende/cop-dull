import { displayBookmarks } from './modules/bookmarks.js'
// import { displayApps } from './modules/apps.js'
// import { displayRecentTabs } from './modules/recentTabs.js'
// import { displayTopSites } from './modules/topSites.js'
import { initSearch } from './modules/nav.js'
import { initContextMenu } from './modules/contextMenu.js'
import { initDragDrop } from './modules/dragDrop.js'
import { initDashboard } from './modules/dashboard.js'
import { initCleaner } from './modules/cleaner.js'
import { initAddFolder } from './modules/addFolder.js'
import { initSettings } from './modules/settings.js'
import { initModals } from './modules/modal.js'

document.addEventListener('DOMContentLoaded', async function () {

  initSearch()
  initContextMenu()
  initDashboard()
  initCleaner()
  initAddFolder()
  initModals()

  // Espera a que se carguen las configuraciones (theme, folder color, etc.)
  await initSettings()

  // Recuperar bookmarks
  browser.bookmarks.getTree(function (bookmarkTreeNodes) {
    displayBookmarks(bookmarkTreeNodes).then(() => {
        initDragDrop()
    })
  })
})
