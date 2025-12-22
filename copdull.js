import { displayBookmarks } from './modules/bookmarks.js'
import { displayApps } from './modules/apps.js'
import { displayRecentTabs } from './modules/recentTabs.js'
import { displayTopSites } from './modules/topSites.js'
import { initSearch } from './modules/search.js'
import { initContextMenu } from './modules/contextMenu.js'

document.addEventListener('DOMContentLoaded', function () {
  // Recuperar bookmarks
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    displayBookmarks(bookmarkTreeNodes)
  })

  initSearch()
  initContextMenu()

  // Recuperar aplicaciones instaladas
  /* chrome.management.getAll(function (apps) {
    displayApps(apps)
  }) */

  // Recuperar pestañas recientemente cerradas
  /* chrome.sessions.getRecentlyClosed(function (sessions) {
    displayRecentTabs(sessions)
  }) */

  // Recuperar las páginas más visitadas
  /* chrome.topSites.get(function (topSites) {
    displayTopSites(topSites)
  }) */
})

/* function displayBookmarks(nodes, parentElement) {
  const list = parentElement || document.getElementById('bookmarkList');
  
  console.log(nodes[0]);
  nodes.forEach(function(node) {
    if (node.children) {
      displayBookmarks(node.children, list);
    } else {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = node.url;
      a.textContent = node.title;
      li.appendChild(a);
      list.appendChild(li);
    }
  });
} */

/* function displayApps(apps) {
  const list = document.getElementById('appsList');
  apps.forEach(function(app) {
    if (app.type === 'packaged_app' || app.type === 'hosted_app') {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = app.appLaunchUrl || app.homepageUrl;
      a.textContent = app.name;
      li.appendChild(a);
      list.appendChild(li);
    }
  });
}

function displayRecentTabs(sessions) {
  const list = document.getElementById('recentTabsList');
  sessions.forEach(function(session) {
    if (session.tab) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = session.tab.url;
      a.textContent = session.tab.title;
      li.appendChild(a);
      list.appendChild(li);
    }
  });
}

function displayTopSites(topSites) {
  const list = document.getElementById('topSitesList');
  topSites.forEach(function(site) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = site.url;
    a.textContent = site.title;
    li.appendChild(a);
    list.appendChild(li);
  });
} */
