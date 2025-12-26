
export function initContextMenu() {
  const contextMenu = document.getElementById('contextMenu')
  const menuClone = document.getElementById('menuClone')
  const menuOpenNewTab = document.getElementById('menuOpenNewTab')
  const menuSeparator = document.querySelector('.menu-separator')
  const menuEdit = document.getElementById('menuEdit')
  const menuDelete = document.getElementById('menuDelete')
  
  const editModal = document.getElementById('editModal')
  const editTitleInput = document.getElementById('editTitle')
  const editUrlInput = document.getElementById('editUrl')
  const saveEditBtn = document.getElementById('saveEdit')
  const cancelEditBtn = document.getElementById('cancelEdit')
  const closeModalBtn = document.getElementById('closeModal')

  let targetId = null
  let targetElement = null
  let targetIsFolder = false

  // --- Context Menu Handler ---
  document.addEventListener('contextmenu', (e) => {
    // Check if right-clicked element is a bookmark link, folder, or search result item
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
        menuClone.style.display = 'block'
        menuOpenNewTab.style.display = 'none'
        // Reset separator if needed, but here we want separator after Clone effectively if we want separation from Edit
        // Original layout: Clone, OpenNewTab, Sep, Edit...
        // If Clone visible, OpenHidden -> Clone, Sep, Edit. This works fine.
        menuSeparator.style.display = 'block' 
      } else {
        // Bookmark options
        menuClone.style.display = 'none'
        menuOpenNewTab.style.display = 'block'
        menuSeparator.style.display = 'block'
      }

      // Position menu
      const { clientX: mouseX, clientY: mouseY } = e
      
      contextMenu.style.left = `${mouseX}px`
      contextMenu.style.top = `${mouseY}px`
      contextMenu.style.display = 'block'
    } else {
      hideContextMenu()
    }
  })

  // Hide context menu on click anywhere
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
      hideContextMenu()
    }
  })

  function hideContextMenu() {
    contextMenu.style.display = 'none'
  }

  // --- Actions ---

  // CLONE
  menuClone.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId || !targetIsFolder) return

    chrome.bookmarks.getSubTree(targetId, (results) => {
       if (chrome.runtime.lastError || !results || !results.length) {
         alert('Error cloning folder')
         return
       }
       const originalTree = results[0]
       
       // Create root clone
       const newTitle = originalTree.title + '_clone'
       const parentId = originalTree.parentId
       
       chrome.bookmarks.create({
         parentId: parentId,
         title: newTitle
         // index: originalTree.index + 1 // Optional: place next to original
       }, (newFolder) => {
          if (chrome.runtime.lastError) {
             console.error(chrome.runtime.lastError)
             return
          }
          // Recursively copy folders only
          if (originalTree.children) {
            copyFolders(originalTree.children, newFolder.id)
          }
          
          // Ideally refresh view logic
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
        alert('Error fetching bookmark')
        return
      }
      const bookmark = results[0]
      // targetIsFolder is already set correctly on contextmenu event
      // but double check? bookmark.url is definitive.
      const isActuallyFolder = !bookmark.url

      editTitleInput.value = bookmark.title
      
      if (isActuallyFolder) {
        // HIDE URL INPUT
        editUrlInput.style.display = 'none'
        // Hide "URL" label (previous sibling)
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
      ? '¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?' 
      : '¿Estás seguro de que quieres eliminar este marcador?'

    if (confirm(msg)) {
      const deleteAction = targetIsFolder 
        ? (id, cb) => chrome.bookmarks.removeTree(id, cb)
        : (id, cb) => chrome.bookmarks.remove(id, cb)

      deleteAction(targetId, () => {
         if (chrome.runtime.lastError) {
           alert('Error removing item: ' + chrome.runtime.lastError.message)
           return
         }
         if (targetElement) targetElement.remove()
         
         const masonryItem = document.querySelector(`.link[data-id="${targetId}"], .folder[data-id="${targetId}"]`)
         if (masonryItem && masonryItem !== targetElement) masonryItem.remove()

         const searchItem = document.querySelector(`.search-result-item[data-id="${targetId}"]`)
         if (searchItem && searchItem !== targetElement) searchItem.remove()
         
         // If we deleted a folder we might be "inside" it or viewing it? 
         // For now primitive removal is fine.
      })
    }
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
      alert('El título es obligatorio')
      return
    }
    
    // Only validate URL if it is NOT a folder
    if (!isFolder && !newUrl) {
      alert('La URL es obligatoria para los marcadores')
      return
    }

    const updates = { title: newTitle }
    if (!isFolder) updates.url = newUrl

    chrome.bookmarks.update(targetId, updates, (updatedNode) => {
      if (chrome.runtime.lastError) {
        alert('Error al actualizar: ' + chrome.runtime.lastError.message)
        return
      }
      
      // Update DOM
      // Find all representations (Grid/Masonry, Search)
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

  // --- Card Context Menu Listeners ---
  const cardContextMenu = document.getElementById('cardContextMenu')
  const cardMenuEdit = document.getElementById('cardMenuEdit')
  const cardMenuNewFolder = document.getElementById('cardMenuNewFolder')
  const cardMenuOpenAll = document.getElementById('cardMenuOpenAll')
  const cardMenuDelete = document.getElementById('cardMenuDelete')
  
  let cardTargetId = null
  
  // Intercept right click on .card
  document.addEventListener('contextmenu', (e) => {
    // If we hit a .card but NOT a .link inside it? No, cards contain links/folders.
    // The requirement says "Los elemento <div> con clase ".card", añadir menu contextual al presionarlos"
    // Usually .card wraps the folder logic in masonry.js or bookmarks.js?
    // In `bookmarks.js`: `const card = document.createElement('div'); card.className = 'card';`
    // The card contains the folder content. 
    // We should check if we clicked on the card itself or its header, OR if we want to override default behavior.
    // "Los elemento <div> con clase ".card""
    
    // Check if we hit a card header specifically
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
  })
  
  function showCardContextMenu(x, y, folderId) {
     // Hide other menus
     contextMenu.style.display = 'none'

     // Determine the ACTUAL target folder ID based on navigation state
     // The 'folderId' passed here is the ROOT card ID.
     // But we might have navigated deep inside.
     // We can check the card's current active folder state from DOM or dataset.
     
     const card = document.querySelector(`.card[data-id="${folderId}"]`)
     let activeFolderId = folderId
     
     if (card && card.dataset.currentId) {
         // currentId is formatted like 'f123'. We need '123'.
         const currentIdRaw = card.dataset.currentId
         if (currentIdRaw.startsWith('f')) {
             activeFolderId = currentIdRaw.substring(1)
         }
     }
     
     // Update the global target ID so actions apply to the ACTIVE folder
     cardTargetId = activeFolderId
     
     // 1. Check content of folder to enable/disable "Open All"
     chrome.bookmarks.getChildren(activeFolderId, (children) => {
         const hasSubfolders = children.some(c => !c.url)
         const hasLinks = children.some(c => c.url)
         
         // User req: "Si la carpeta en la que se encuentra, solo hay links (NO HAY SUBCARPETAS)"
         if (hasLinks && !hasSubfolders) {
             cardMenuOpenAll.style.display = 'block'
         } else {
             cardMenuOpenAll.style.display = 'none'
         }
         
         cardContextMenu.style.left = `${x}px`
         cardContextMenu.style.top = `${y}px`
         cardContextMenu.style.display = 'block'
     })
  }

  // Hide on click
  document.addEventListener('click', (e) => {
    if (!cardContextMenu.contains(e.target)) {
       cardContextMenu.style.display = 'none'
    }
  })
  
  // --- Card Actions ---
  
  // EDIT NAME (Reuse existing modal logic?)
  cardMenuEdit.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      // Use existing edit logic but force folder mode
      targetId = cardTargetId
      targetIsFolder = true // Cards represent folders
      
      // Manually trigger the edit setup
      chrome.bookmarks.get(targetId, (results) => {
          if (!results || !results.length) return
          const node = results[0]
          
          editTitleInput.value = node.title
          // Hide URL stuff
          editUrlInput.style.display = 'none'
          if(editUrlInput.previousElementSibling) editUrlInput.previousElementSibling.style.display = 'none'
          editUrlInput.value = '' 
          
          editModal.style.display = 'flex'
          editTitleInput.focus()
          editModal.dataset.isFolder = 'true'
      })
  })
  
  // NEW FOLDER (Reuse AddFolder logic or similar)
  cardMenuNewFolder.addEventListener('click', () => {
      cardContextMenu.style.display = 'none'
      if (!cardTargetId) return
      
      // Open "Add Folder" modal, pre-setting parent?
      const addFolderModal = document.getElementById('addFolderModal')
      const input = document.getElementById('newFolderTitle')
      
      // We need to hook into the creation logic to use THIS parent instead of default '1'.
      // The `addFolder.js` module uses a hardcoded parent or assumes '1'.
      // We should probably expose a way to set parent or just duplicate simple logic here?
      // Duplicating simple logic is safer here to avoid cross-module coupling hacks quickly.
      
      input.value = ''
      addFolderModal.style.display = 'flex'
      input.focus()
      
      // We need to override the "Create" button behavior or add a one-time listener.
      // Standard `initAddFolder` adds a listener that always creates in '1'.
      // We should probably MODIFY `initAddFolder` to accept context, or handle it here uniquely.
      // Let's handle it here uniquely:
      
      const createBtn = document.getElementById('createFolderBtn')
      
      // Clone button to strip existing listeners to avoid double creation?
      // Or just set a global "targetParentId" on the modal dataset?
      addFolderModal.dataset.parentId = cardTargetId
  })
  
  // OPEN ALL
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
      
      if (confirm('ATENCIÓN: Se eliminará la carpeta y TODO su contenido (carpetas y archivos). ¿Estás seguro?')) {
          chrome.bookmarks.removeTree(cardTargetId, () => {
              // DOM update: remove the card
              const card = document.querySelector(`.card[data-id="${cardTargetId}"]`)
              if (card) card.remove()
              
              // Also refresh masonry layout if possible?
              // window.location.reload() might be safest for heavy deletes.
              setTimeout(() => window.location.reload(), 200)
          })
      }
  })

  // Close modal on click outside content
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal()
    }
  })
}
