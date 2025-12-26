
import { fadeIn, fadeOut } from './search.js'

export function initAddFolder() {
  const addFolderBtn = document.getElementById('addFolderBtn')
  const modal = document.getElementById('addFolderModal')
  const closeBtn = document.getElementById('closeAddFolderModal')
  const cancelBtn = document.getElementById('cancelAddFolder')
  const createBtn = document.getElementById('createFolderBtn')
  const input = document.getElementById('newFolderTitle')
  
  // Elements to hide when other views are active?
  // The user says: "This button should be hidden when the view changes (search, Recents/Top, Clean)"
  // This implies we need to listener to state changes or proactively check.
  // Actually, simpler: Search/Dashboard/Cleaner logic should just hide this button or the whole header actions container?
  // The header-actions container has "Recents/Top", "Clean", "+ Folder".
  // If we just want to hide THIS button, we can expose a function or listen to events.
  // BUT the easiest way is to modify the existing toggle logics in search.js, dashboard.js, cleaner.js to also hide this button.
  // HOWEVER, I can also add an observer or just poll state? No, direct control is better.
  
  // Let's implement the Modal Logic first.
  
  addFolderBtn.addEventListener('click', () => {
    openModal()
  })
  
  function openModal() {
    input.value = ''
    modal.style.display = 'flex'
    // Animation handled by CSS usually if class 'modal-overlay' has it, but here style is just toggled.
    // The CSS has animation: fadeIn.
    input.focus()
  }
  
  function createFolder() {
    const title = input.value.trim()
    if (!title) return
    
    // Check if we have a specific parent override (from context menu)
    let parentId = '1' // Default: Bookmarks Bar
    if (modal.dataset.parentId) {
        parentId = modal.dataset.parentId
    }

    chrome.bookmarks.create({
      parentId: parentId,
      title: title
    }, (newFolder) => {
      // Success
      closeModal()
      
      // Cleanup custom parent
      delete modal.dataset.parentId
      
      refreshBookmarks()
    })
  }

  function closeModal() {
    modal.style.display = 'none'
    delete modal.dataset.parentId
  }
  
  closeBtn.addEventListener('click', closeModal)
  cancelBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })
  
  createBtn.addEventListener('click', createFolder)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createFolder()
  })
}

async function refreshBookmarks() {
  const container = document.getElementById('bookmarkList')
  // We need to re-import displayBookmarks or move the logic?
  // Since we are in a module system, we can just import it.
  // But displayBookmarks expects `bookmarkTreeNodes`.
  
  // Dynamic import to avoid circular dep if needed? No, standard import is fine usually.
  const { displayBookmarks } = await import('./bookmarks.js')
  const { initDragDrop } = await import('./dragDrop.js')
  
  container.innerHTML = '' // Clear current
  
  chrome.bookmarks.getTree(async (nodes) => {
    await displayBookmarks(nodes)
    initDragDrop() // Re-bind drag drop
  })
}

export function setAddFolderButtonVisibility(visible) {
  const btn = document.getElementById('addFolderBtn')
  if (btn) {
    btn.style.display = visible ? 'flex' : 'none'
  }
}
