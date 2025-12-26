import { showConfirmModal, showInfoModal } from './modal.js'
import { getTranslation } from './settings.js'

export function initContextMenu() {
  const contextMenu = document.getElementById('contextMenu')
  const menuClone = document.getElementById('menuClone')
  const menuOpenNewTab = document.getElementById('menuOpenNewTab')
  const menuSeparator = document.querySelector('.menu-separator')
  const menuEdit = document.getElementById('menuEdit')
  const menuDelete = document.getElementById('menuDelete')
  
  // Card Context Menu placeholders
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

  // --- Context Menu Handler ---
  document.addEventListener('contextmenu', (e) => {
    hideContextMenu()

    // 1. Check if right-clicked element is a bookmark link, folder, or search result item
    const element = e.target.closest('.link, .folder, .search-result-item')
    
    if (element && element.dataset.id) {
      e.preventDefault()
      e.stopPropagation()
      
      targetElement = element
      targetId = element.dataset.id
      targetIsFolder = element.classList.contains('folder')
      
      // Toggle Options based on type
      if (targetIsFolder) {
        // Folder options
        menuClone.style.display = 'flex'
        menuOpenNewTab.style.display = 'none'
        menuSeparator.style.display = 'block'
      } else {
        // Bookmark options
        menuClone.style.display = 'none'
        menuOpenNewTab.style.display = 'flex'
        menuSeparator.style.display = 'flex'
      }

      // Position menu
      const { clientX: mouseX, clientY: mouseY } = e
      
      contextMenu.style.left = `${mouseX}px`
      contextMenu.style.top = `${mouseY}px`
      contextMenu.style.display = 'block'
      return
    }

    // 2. Check if right-clicked element is a CARD HEADER
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
    
    // 3. Block default context menu globally (except for inputs)
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
        e.preventDefault()
    }
  })

  // Hide context menu on click anywhere
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target) && !cardContextMenu.contains(e.target)) {
      hideContextMenu()
    }
  })

  function hideContextMenu() {
    contextMenu.style.display = 'none'
    cardContextMenu.style.display = 'none'
  }

  // --- Actions ---

  // CLONE
  menuClone.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId || !targetIsFolder) return

    chrome.bookmarks.getSubTree(targetId, (results) => {
       if (chrome.runtime.lastError || !results || !results.length) {
         showInfoModal('Error', 'Error cloning folder')
         return
       }
       const originalTree = results[0]
       
       // Create root clone
       const newTitle = originalTree.title + '_clone'
       const parentId = originalTree.parentId
       
       chrome.bookmarks.create({
         parentId: parentId,
         title: newTitle
       }, (newFolder) => {
          if (chrome.runtime.lastError) {
             console.error(chrome.runtime.lastError)
             return
          }
          // Recursively copy folders only
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
      // Only copy directories (no url)
      if (!node.url) {
        chrome.bookmarks.create({
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

  // OPEN IN NEW TAB
  menuOpenNewTab.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId || targetIsFolder) return

    chrome.bookmarks.get(targetId, (results) => {
      const bookmark = results[0]
      if (bookmark && bookmark.url) {
        window.open(bookmark.url, '_blank')
      }
    })
  })

  // EDIT
  menuEdit.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId) return

    chrome.bookmarks.get(targetId, (results) => {
      if (chrome.runtime.lastError || !results || !results.length) {
        showInfoModal('Error', 'Error fetching bookmark')
        return
      }
      const bookmark = results[0]
      const isActuallyFolder = !bookmark.url

      editTitleInput.value = bookmark.title
      
      if (isActuallyFolder) {
        // HIDE URL INPUT
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

  // DELETE
  menuDelete.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId) return

    const msg = targetIsFolder 
      ? getTranslation('msgConfirmDelete') 
      : getTranslation('msgConfirmDelete')

    showConfirmModal(getTranslation('modalConfirmTitle'), msg, () => {
      const deleteAction = targetIsFolder 
        ? (id, cb) => chrome.bookmarks.removeTree(id, cb)
        : (id, cb) => chrome.bookmarks.remove(id, cb)

      deleteAction(targetId, () => {
         if (chrome.runtime.lastError) {
           showInfoModal('Error', 'Error removing item: ' + chrome.runtime.lastError.message)
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
  
  // --- Modal Handlers ---

  function closeEditModal() {
    editModal.style.display = 'none'
    targetId = null
    targetElement = null
    delete editModal.dataset.isFolder
  }

  closeModalBtn.addEventListener('click', closeEditModal)
  cancelEditBtn.addEventListener('click', closeEditModal)

  // Save Edit
  saveEditBtn.addEventListener('click', async () => {
    if (!targetId) return

    const newTitle = editTitleInput.value.trim()
    const newUrl = editUrlInput.value.trim()
    const isFolder = editModal.dataset.isFolder === 'true'

    if (!newTitle) {
      showInfoModal('Error', getTranslation('modalEditLabelTitle') + ' es obligatorio')
      return
    }
    
    // Only validate URL if it is NOT a folder
    if (!isFolder && !newUrl) {
      showInfoModal('Error', 'URL es obligatoria')
      return
    }

    const updates = { title: newTitle }
    if (!isFolder) updates.url = newUrl

    chrome.bookmarks.update(targetId, updates, (updatedNode) => {
      if (chrome.runtime.lastError) {
        showInfoModal('Error', 'Error: ' + chrome.runtime.lastError.message)
        return
      }
      
      // Update DOM
      const elements = document.querySelectorAll(`[data-id="${targetId}"]`)
      elements.forEach(el => {
         if (isFolder) {
            // Update folder UI
            if (el.classList.contains('folder')) {
               el.dataset.title = updatedNode.title
               const titleDiv = el.querySelector('.folder-title')
               if (titleDiv) titleDiv.textContent = updatedNode.title
            }
         } else {
             // Update link UI
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
     // Hide other menus
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
     
     chrome.bookmarks.getChildren(activeFolderId, (children) => {
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

  // --- Card Actions ---
  
  cardMenuEdit.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      targetId = cardTargetId
      targetIsFolder = true 
      
      chrome.bookmarks.get(targetId, (results) => {
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
      
      chrome.bookmarks.getChildren(cardTargetId, (children) => {
          children.forEach(c => {
              if (c.url) window.open(c.url, '_blank')
          })
      })
  })
  
  // DELETE CARD
  cardMenuDelete.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      const msg = 'ATENCIÓN: Se eliminará la carpeta y TODO su contenido (carpetas y archivos). ¿Estás seguro?' 
      
      showConfirmModal(getTranslation('modalConfirmTitle'), msg, () => {
          chrome.bookmarks.removeTree(cardTargetId, () => {
              const card = document.querySelector(`.card[data-id="${cardTargetId}"]`)
              if (card) card.remove()
              
              setTimeout(() => window.location.reload(), 200)
          })
      })
  })
  
  // Close modal on click outside
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal()
    }
  })
}
