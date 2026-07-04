import { showConfirmModal, showInfoModal } from './modal.js'
import { getTranslation } from './settings.js'

export function initContextMenu() {
  const contextMenu = document.getElementById('contextMenu')
  const menuClone = document.getElementById('menuClone')
  const menuOpenNewTab = document.getElementById('menuOpenNewTab')
  const menuSeparator = document.querySelector('.menu-separator')
  const menuEdit = document.getElementById('menuEdit')
  const menuDelete = document.getElementById('menuDelete')
  
  const cardContextMenu = document.getElementById('cardContextMenu')
  const cardMenuEdit = document.getElementById('cardMenuEdit')
  const cardMenuNewFolder = document.getElementById('cardMenuNewFolder')
  const cardMenuOpenAll = document.getElementById('cardMenuOpenAll')
  const cardMenuDelete = document.getElementById('cardMenuDelete')

  const editModal = document.getElementById('editModal')
  const editTitleInput = document.getElementById('editTitle')
  const editUrlInput = document.getElementById('editUrl')
  const saveEditBtn = document.getElementById('saveEdit')
  const cancelEditBtn = document.getElementById('cancelEdit')
  const closeModalBtn = document.getElementById('closeModal')

  let targetId = null
  let targetElement = null
  let targetIsFolder = false
  let cardTargetId = null

  // --- Gestor Context Menu ---
  document.addEventListener('contextmenu', (e) => {
    hideContextMenu()

    // 1. Comprobar si el elemento derecho clicado es un enlace de marcador, carpeta o elemento de resultado de búsqueda
    const element = e.target.closest('.link, .folder, .search-result-item')
    
    if (element && element.dataset.id) {
      e.preventDefault()
      e.stopPropagation()
      
      targetElement = element
      targetId = element.dataset.id
      targetIsFolder = element.classList.contains('folder')
      
      // Opciones basadas en tipo
      if (targetIsFolder) {
        // Opciones de carpeta
        menuClone.style.display = 'flex'
        menuOpenNewTab.style.display = 'none'
        menuSeparator.style.display = 'block'
      } else {
        // Opciones de marcador
        menuClone.style.display = 'none'
        menuOpenNewTab.style.display = 'flex'
        menuSeparator.style.display = 'flex'
      }

      // Posicionar menu
      const { clientX: mouseX, clientY: mouseY } = e
      
      contextMenu.style.left = `${mouseX}px`
      contextMenu.style.top = `${mouseY}px`
      contextMenu.style.display = 'block'
      return
    }

    // 2. Comprobar si el elemento derecho clicado es un encabezado de tarjeta
    const cardHeader = e.target.closest('.card-header')
    if (cardHeader) {
      const card = cardHeader.closest('.card')
      if (card && card.dataset.id) {
          e.preventDefault()
          e.stopPropagation()
          
          cardTargetId = card.dataset.id
          showCardContextMenu(e.clientX, e.clientY, cardTargetId)
          return
      }
    }
    
    // 3. Bloquear el menu contextual globalmente (excepto para inputs)
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
        e.preventDefault()
    }
  })

  // Ocultar menu contextual al hacer clic en cualquier lugar
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target) && !cardContextMenu.contains(e.target)) {
      hideContextMenu()
    }
  })

  function hideContextMenu() {
    contextMenu.style.display = 'none'
    cardContextMenu.style.display = 'none'
  }

  // --- Acciones ---

  // CLONAR (Solo estructura de carpetas y subcarpetas)
  menuClone.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId || !targetIsFolder) return

    browser.bookmarks.getSubTree(targetId, (results) => {
       if (browser.runtime.lastError || !results || !results.length) {
         showInfoModal('Error', 'Error cloning folder')
         return
       }
       const originalTree = results[0]
       
       // Crear raiz clonada
       const newTitle = originalTree.title + '_clone'
       const parentId = originalTree.parentId
       
       browser.bookmarks.create({
         parentId: parentId,
         title: newTitle
       }, (newFolder) => {
          if (browser.runtime.lastError) {
             console.error(browser.runtime.lastError)
             return
          }
          // Copiar carpetas recursivamente
          if (originalTree.children) {
            copyFolders(originalTree.children, newFolder.id)
          }
          
          setTimeout(() => {
            window.location.reload()
          }, 200)
       })
    })
  })
  
  function copyFolders(nodes, parentId) {
    nodes.forEach(node => {
      // Solo copiar carpetas (no url)
      if (!node.url) {
        browser.bookmarks.create({
          parentId: parentId,
          title: node.title
        }, (newSubFolder) => {
           if (node.children) {
             copyFolders(node.children, newSubFolder.id)
           }
        })
      }
    })
  }

  // Abrir en nueva pestaña
  menuOpenNewTab.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId || targetIsFolder) return

    browser.bookmarks.get(targetId, (results) => {
      const bookmark = results[0]
      if (bookmark && bookmark.url) {
        window.open(bookmark.url, '_blank')
      }
    })
  })

  // Editar
  menuEdit.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId) return

    browser.bookmarks.get(targetId, (results) => {
      if (browser.runtime.lastError || !results || !results.length) {
        showInfoModal('Error', 'Error fetching bookmark')
        return
      }
      const bookmark = results[0]
      const isActuallyFolder = !bookmark.url

      editTitleInput.value = bookmark.title
      
      if (isActuallyFolder) {
        // Ocultar entrada de URL
        editUrlInput.style.display = 'none'
        if(editUrlInput.previousElementSibling) editUrlInput.previousElementSibling.style.display = 'none'
        editUrlInput.value = '' 
      } else {
        editUrlInput.style.display = 'block'
        if(editUrlInput.previousElementSibling) editUrlInput.previousElementSibling.style.display = 'block'
        editUrlInput.value = bookmark.url
      }
      
      editModal.style.display = 'flex'
      editTitleInput.focus()
      
      // Store state
      editModal.dataset.isFolder = isActuallyFolder
    })
  })

  // Borrar
  menuDelete.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId) return

    const msg = targetIsFolder 
      ? getTranslation('msgConfirmDelete') 
      : getTranslation('msgConfirmDelete')

    showConfirmModal(getTranslation('modalConfirmTitle'), msg, () => {
      const deleteAction = targetIsFolder 
        ? (id, cb) => browser.bookmarks.removeTree(id, cb)
        : (id, cb) => browser.bookmarks.remove(id, cb)

      deleteAction(targetId, () => {
         if (browser.runtime.lastError) {
           showInfoModal('Error', 'Error removing item: ' + browser.runtime.lastError.message)
           return
         }
         if (targetElement) targetElement.remove()
         
         const masonryItem = document.querySelector(`.link[data-id="${targetId}"], .folder[data-id="${targetId}"]`)
         if (masonryItem && masonryItem !== targetElement) masonryItem.remove()

         const searchItem = document.querySelector(`.search-result-item[data-id="${targetId}"]`)
         if (searchItem && searchItem !== targetElement) searchItem.remove()
      })
    })
  })
  
  // --- Gestor de Modal ---

  function closeEditModal() {
    editModal.style.display = 'none'
    targetId = null
    targetElement = null
    delete editModal.dataset.isFolder
  }

  closeModalBtn.addEventListener('click', closeEditModal)
  cancelEditBtn.addEventListener('click', closeEditModal)

  // Guardar Edición
  saveEditBtn.addEventListener('click', async () => {
    if (!targetId) return

    const newTitle = editTitleInput.value.trim()
    const newUrl = editUrlInput.value.trim()
    const isFolder = editModal.dataset.isFolder === 'true'

    if (!newTitle) {
      showInfoModal('Error', getTranslation('modalEditLabelTitle') + ' es obligatorio')
      return
    }
    
    //  Validar URL solo si no es una carpeta
    if (!isFolder && !newUrl) {
      showInfoModal('Error', 'URL es obligatoria')
      return
    }

    const updates = { title: newTitle }
    if (!isFolder) updates.url = newUrl

    browser.bookmarks.update(targetId, updates, (updatedNode) => {
      if (browser.runtime.lastError) {
        showInfoModal('Error', 'Error: ' + browser.runtime.lastError.message)
        return
      }
      
      // Actualizar DOM
      const elements = document.querySelectorAll(`[data-id="${targetId}"]`)
      elements.forEach(el => {
         if (isFolder) {
            // Actualizar UI de la carpeta
            if (el.classList.contains('folder')) {
               el.dataset.title = updatedNode.title
               const titleDiv = el.querySelector('.folder-title')
               if (titleDiv) titleDiv.textContent = updatedNode.title
            }
         } else {
             // Actualizar UI del enlace
             const a = el.querySelector('a')
             if (a) {
                a.textContent = updatedNode.title
                a.href = updatedNode.url
             }
             const img = el.querySelector('img')
             if (img) img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${updatedNode.url}`
         }
      })

      closeEditModal()
    })
  })


  
  function showCardContextMenu(x, y, folderId) {
     // Ocultar otros menus
     contextMenu.style.display = 'none'
     
     const card = document.querySelector(`.card[data-id="${folderId}"]`)
     let activeFolderId = folderId
     
     if (card && card.dataset.currentId) {
         const currentIdRaw = card.dataset.currentId
         if (currentIdRaw.startsWith('f')) {
             activeFolderId = currentIdRaw.substring(1)
         }
     }
     
     cardTargetId = activeFolderId
     
     browser.bookmarks.getChildren(activeFolderId, (children) => {
         const hasSubfolders = children.some(c => !c.url)
         const hasLinks = children.some(c => c.url)
         
         if (hasLinks && !hasSubfolders) {
             cardMenuOpenAll.style.display = 'flex'
         } else {
             cardMenuOpenAll.style.display = 'none'
         }
         
         cardContextMenu.style.left = `${x}px`
         cardContextMenu.style.top = `${y}px`
         cardContextMenu.style.display = 'block'
     })
  }

  // --- Acciones de la card ---
  
  cardMenuEdit.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      targetId = cardTargetId
      targetIsFolder = true 
      
      browser.bookmarks.get(targetId, (results) => {
          if (!results || !results.length) return
          const node = results[0]
          
          editTitleInput.value = node.title
          editUrlInput.style.display = 'none'
          if(editUrlInput.previousElementSibling) editUrlInput.previousElementSibling.style.display = 'none'
          editUrlInput.value = '' 
          
          editModal.style.display = 'flex'
          editTitleInput.focus()
          editModal.dataset.isFolder = 'true'
      })
  })
  
  cardMenuNewFolder.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      const addFolderModal = document.getElementById('addFolderModal')
      const input = document.getElementById('newFolderTitle')
      
      input.value = ''
      addFolderModal.style.display = 'flex'
      input.focus()
      
      addFolderModal.dataset.parentId = cardTargetId
  })
  
  cardMenuOpenAll.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      browser.bookmarks.getChildren(cardTargetId, (children) => {
          children.forEach(c => {
              if (c.url) window.open(c.url, '_blank')
          })
      })
  })
  
  // Borrar Card
  cardMenuDelete.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      const msg = 'ATENCIÓN: Se eliminará la carpeta y TODO su contenido (carpetas y archivos). ¿Estás seguro?' 
      
      showConfirmModal(getTranslation('modalConfirmTitle'), msg, () => {
          browser.bookmarks.removeTree(cardTargetId, () => {
              const card = document.querySelector(`.card[data-id="${cardTargetId}"]`)
              if (card) card.remove()
              
              setTimeout(() => window.location.reload(), 200)
          })
      })
  })
  
  // Cerrar modal al hacer clic fuera
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal()
    }
  })
}
