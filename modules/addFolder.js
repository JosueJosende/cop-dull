
import { fadeIn, fadeOut } from './nav.js'

export function initAddFolder() {
  const addFolderBtn = document.getElementById('addFolderBtn')
  const modal = document.getElementById('addFolderModal')
  const closeBtn = document.getElementById('closeAddFolderModal')
  const cancelBtn = document.getElementById('cancelAddFolder')
  const createBtn = document.getElementById('createFolderBtn')
  const input = document.getElementById('newFolderTitle')
  
  // Implementemos la lógica del Modal primero.
  addFolderBtn.addEventListener('click', () => {
    openModal()
  })
  
  function openModal() {
    input.value = ''
    modal.style.display = 'flex'
    // La animación se maneja por CSS generalmente si la clase 'modal-overlay' tiene animación, pero aquí solo se cambia el estilo.
    // El CSS tiene animation: fadeIn.
    input.focus()
  }
  
  function createFolder() {
    const title = input.value.trim()
    if (!title) return
    
    // Comprobar si tenemos un override de parent específico (desde el menú contextual)
    let parentId = '1' // Default: Bookmarks Bar
    if (modal.dataset.parentId) {
        parentId = modal.dataset.parentId
    }

    chrome.bookmarks.create({
      parentId: parentId,
      title: title
    }, (newFolder) => {
      // Éxito
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
  // Se necesita re-importar displayBookmarks o mover la lógica?
  // Como estamos en un sistema de módulos, podemos simplemente importarlo.
  // Pero displayBookmarks espera `bookmarkTreeNodes`.
  
  // Import dinámico para evitar dependencias circulares si es necesario? No, la importación estándar generalmente es suficiente.
  const { displayBookmarks } = await import('./bookmarks.js')
  const { initDragDrop } = await import('./dragDrop.js')
  
  container.innerHTML = '' // Limpiar el contenedor actual
  
  chrome.bookmarks.getTree(async (nodes) => {
    await displayBookmarks(nodes)
    initDragDrop() // Volver a enlazar drag drop
  })
}

export function setAddFolderButtonVisibility(visible) {
  const btn = document.getElementById('addFolderBtn')
  if (btn) {
    btn.style.display = visible ? 'flex' : 'none'
  }
}
