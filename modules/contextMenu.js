
export function initContextMenu() {
  const contextMenu = document.getElementById('contextMenu')
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

  // --- Context Menu Handler ---
  document.addEventListener('contextmenu', (e) => {
    // Check if right-clicked element is a bookmark link or search result item
    const link = e.target.closest('.link, .search-result-item')
    
    if (link && link.dataset.id) {
      e.preventDefault()
      
      targetElement = link
      targetId = link.dataset.id
      
      // Position menu
      const { clientX: mouseX, clientY: mouseY } = e
      
      // Adjust if close to edge
      let x = mouseX
      let y = mouseY
      
      contextMenu.style.left = `${x}px`
      contextMenu.style.top = `${y}px`
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
      editTitleInput.value = bookmark.title
      editUrlInput.value = bookmark.url || ''
      
      editModal.style.display = 'flex'
      editTitleInput.focus()
    })
  })

  // DELETE
  menuDelete.addEventListener('click', () => {
    hideContextMenu()
    if (!targetId) return

    if (confirm('¿Estás seguro de que quieres eliminar este marcador?')) {
      chrome.bookmarks.remove(targetId, () => {
         if (chrome.runtime.lastError) {
           alert('Error removing bookmark')
           return
         }
         // Remove from DOM
         // Remove from Masonry view
         const masonryItem = document.querySelector(`.link[data-id="${targetId}"]`)
         if (masonryItem) {
           masonryItem.remove()
           // Re-trigger masonry if needed? Usually minimasonry handles removals on reload, 
           // but for live update we might leave a hole or need to trigger reloadMasonry().
           // We can import reloadMasonry if we want, or Dispatch a custom event.
           // Ideally, copdull.js/bookmarks.js should export reloadMasonry or similar.
           // For now, removing the element is visual enough, layouts might shift on next reload or resize.
         }

         // Remove from Search Results
         const searchItem = document.querySelector(`.search-result-item[data-id="${targetId}"]`)
         if (searchItem) {
           searchItem.remove()
           // Update search header count? - Optional enhancement
         }
      })
    }
  })

  // --- Modal Handlers ---

  function closeEditModal() {
    editModal.style.display = 'none'
    targetId = null
    targetElement = null
  }

  closeModalBtn.addEventListener('click', closeEditModal)
  cancelEditBtn.addEventListener('click', closeEditModal)

  // Save Edit
  saveEditBtn.addEventListener('click', async () => {
    if (!targetId) return

    const newTitle = editTitleInput.value.trim()
    const newUrl = editUrlInput.value.trim()

    if (!newTitle || !newUrl) {
      alert('Por favor, rellena todos los campos')
      return
    }

    chrome.bookmarks.update(targetId, { title: newTitle, url: newUrl }, (updatedNode) => {
      if (chrome.runtime.lastError) {
        alert('Error al actualizar el marcador')
        return
      }

      // Update DOM elements
      const masonryItem = document.querySelector(`.link[data-id="${targetId}"]`)
      if (masonryItem) {
         const a = masonryItem.querySelector('a')
         if (a) {
           a.textContent = updatedNode.title
           a.href = updatedNode.url
         }
         const img = masonryItem.querySelector('img')
         if (img) {
            img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${updatedNode.url}`
         }
      }

      const searchItem = document.querySelector(`.search-result-item[data-id="${targetId}"]`)
      if (searchItem) {
         const a = searchItem.querySelector('a')
         if (a) {
           a.textContent = updatedNode.title
           a.href = updatedNode.url
         }
         const img = searchItem.querySelector('img')
         if (img) {
            img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${updatedNode.url}`
         }
      }

      closeEditModal()
    })
  })

  // Close modal on click outside content
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal()
    }
  })
}
