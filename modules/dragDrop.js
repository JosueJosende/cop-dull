import { reloadMasonry } from './masonry.js'

export function initDragDrop() {
  const container = document.getElementById('bookmarkList')
  let dragSource = null
  let dragSourceId = null
  let placeholder = document.createElement('div')
  placeholder.className = 'drop-placeholder'

  let masonryTimeout = null

  // Delegated listeners
  container.addEventListener('dragstart', handleDragStart)
  container.addEventListener('dragover', handleDragOver)
  container.addEventListener('dragleave', handleDragLeave)
  container.addEventListener('drop', handleDrop)
  container.addEventListener('dragend', handleDragEnd)

  function handleDragStart(e) {
    const target = e.target.closest('.link, .folder, .card')
    if (!target) return

    dragSource = target
    dragSourceId = target.dataset.id
    
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dragSourceId)

    // Visuals
    requestAnimationFrame(() => {
      target.classList.add('dragging')
    })
  }

  function handleDragOver(e) {
    e.preventDefault() 
    e.dataTransfer.dropEffect = 'move'

    const target = e.target.closest('.link, .folder, .card')
    if (!target) return

    // Avoid dropping inside itself
    if (dragSource && (target === dragSource || dragSource.contains(target))) {
      return
    }

    // Logic for placeholder vs "dropping into folder/card"
    const isFolder = target.classList.contains('folder')
    const isCard = target.classList.contains('card')
    
    // We can drop into a Card (append to root of folder) OR a Folder (subfolder)
    // Only if dragging a Link/Folder (not Card over Card, usually)
    // But allowing Card reorder is good.

    const rect = target.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const height = rect.height
    
    // Thresholds: if hovering middle of a FOLDER/CARD, maybe drop INSIDE?
    // For bookmarks, we always reorder.
    // For folders, we might reorder (top/bottom edge) or drop inside (middle).
    
    const edgeThreshold = 0.25
    
    // Reset previous folder highlights
    document.querySelectorAll('.drop-target-folder').forEach(el => el.classList.remove('drop-target-folder'))

    // DROP INTO FOLDER LOGIC
    // Allow dropping link/folder INTO another folder/card.
    // Cannot drop Card into Card (usually).
    const draggingCard = dragSource.classList.contains('card')
    
    if (!draggingCard && (isFolder || isCard)) {
       // If hovering middle -> Drop Inside
       if (relativeY > height * edgeThreshold && relativeY < height * (1 - edgeThreshold)) {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder)
          target.classList.add('drop-target-folder')
          return
       }
    }

    // REORDER LOGIC
    // If dragging Card, only reorder against Cards.
    // If dragging Link/Folder, only reorder against Link/Folder.
    
    if (draggingCard && !isCard) return // Can't reorder Card against a Link
    if (!draggingCard && isCard) return // Can't reorder Link against a Card (visual hierarchy mismatch)
    
    // Insert PlaceHolder
    if (relativeY < height / 2) {
      target.parentNode.insertBefore(placeholder, target)
    } else {
      target.parentNode.insertBefore(placeholder, target.nextSibling)
    }

    // Throttle Masonry Layout for smoother experience
    // Only needed if dragging causes layout shift (e.g. Card dragging, or adding placeholder changes height)
    if (!masonryTimeout) {
        masonryTimeout = setTimeout(() => {
            reloadMasonry()
            masonryTimeout = null
        }, 100)
    }
  }

  function handleDragLeave(e) {
     const target = e.target.closest('.folder, .card')
     if (target) {
       target.classList.remove('drop-target-folder')
     }
  }

  function handleDrop(e) {
    e.preventDefault()
    
    const dropTargetFolder = document.querySelector('.drop-target-folder')
    
    // DROP INTO FOLDER
    if (dropTargetFolder) {
      // Use dataset.id for Folders, but for Cards we need the FOLDER ID it represents.
      // Cards have dataset.id (which is the folder ID).
      const parentId = dropTargetFolder.dataset.id
      
      if (dragSource) dragSource.remove()
      moveBookmark(dragSourceId, parentId) // Appends to end
    } 
    // REORDER
    else if (placeholder.parentNode) {
      const parentContainer = placeholder.parentNode
      let parentId = null
      
      // Determine Parent ID correct logic
      if (parentContainer.classList.contains('folder')) {
         parentId = parentContainer.dataset.id
      } else if (parentContainer.classList.contains('card')) {
          parentId = parentContainer.dataset.id
      } else if (parentContainer.id === 'bookmarkList') {
         if (dragSource && dragSource.dataset.parentId) {
             parentId = dragSource.dataset.parentId
         } else {
             parentId = '1'
         }
      }

      // Calculate Index
      let newIndex = 0
      let isMovingDown = false
      const siblings = Array.from(parentContainer.children)
      
      for (const child of siblings) {
        if (child === placeholder) break
        if (child === dragSource) isMovingDown = true
        
        if (child !== dragSource && 
           (child.classList.contains('link') || 
            child.classList.contains('folder') || 
            child.classList.contains('card'))) {
           
           if (child.style.display !== 'none' || child.classList.contains('card')) { 
               newIndex++
           }
        }
      }
      
      const sourceParentId = dragSource ? dragSource.dataset.parentId : null
      // Strict equality check might fail if types differ (string vs int in dataset if manual/api mismatch)
      // Usually dataset is string. API returns strings.
      if (sourceParentId == parentId && isMovingDown) {
          newIndex++
      }
      
      // Optimistic Update
      parentContainer.insertBefore(dragSource, placeholder)
      
      moveBookmark(dragSourceId, parentId, newIndex)
    }

    cleanup()
    
    setTimeout(() => {
        reloadMasonry()
    }, 50)
  }

  function handleDragEnd(e) {
    cleanup()
  }

  function cleanup() {
    if (dragSource) dragSource.classList.remove('dragging')
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder)
    document.querySelectorAll('.drop-target-folder').forEach(el => el.classList.remove('drop-target-folder'))
    dragSource = null
    dragSourceId = null
    if (masonryTimeout) clearTimeout(masonryTimeout)
  }

  function moveBookmark(id, parentId, index) {
    const destination = { parentId: parentId }
    if (typeof index === 'number') {
      destination.index = index
    }
    
    console.log(`Moving ${id} to parent ${parentId} at index ${index}`)

    chrome.bookmarks.move(id, destination, (result) => {
       if (chrome.runtime.lastError) {
         console.error(chrome.runtime.lastError.message)
         // window.location.reload() // Or show error
       }
    })
  }
}
