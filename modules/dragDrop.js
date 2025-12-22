
import { reloadMasonry } from './masonry.js'

export function initDragDrop() {
  const container = document.getElementById('bookmarkList')
  let dragSource = null
  let dragSourceId = null
  let dragType = null // 'link' or 'folder'
  let placeholder = document.createElement('div')
  placeholder.className = 'drop-placeholder'

  // Delegated listeners
  container.addEventListener('dragstart', handleDragStart)
  container.addEventListener('dragover', handleDragOver)
  container.addEventListener('dragleave', handleDragLeave)
  container.addEventListener('drop', handleDrop)
  container.addEventListener('dragend', handleDragEnd)

  function handleDragStart(e) {
    const target = e.target.closest('.link, .folder')
    if (!target) return

    dragSource = target
    dragSourceId = target.dataset.id
    dragType = target.classList.contains('folder') ? 'folder' : 'link'
    
    // Set data
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dragSourceId)
    e.dataTransfer.setData('type', dragType)

    // Visuals
    setTimeout(() => {
      target.classList.add('dragging')
    }, 0)
  }

  function handleDragOver(e) {
    e.preventDefault() // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move'

    const target = e.target.closest('.link, .folder, .card')
    if (!target) return

    // Avoid dropping inside itself
    if (dragSource && (target === dragSource || dragSource.contains(target))) {
      return
    }

    // Logic for placeholder vs "dropping into folder"
    // If target is a folder and different from source, we might want to drop *inside*
    // Or if we are hovering the edges, we might want to reorder *around* it.
    
    // Check if target is a folder we can drop into
    const isFolder = target.classList.contains('folder')
    
    const rect = target.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const height = rect.height
    
    // Thresholds for reordering vs dropping inside (25% top/bottom for reorder)
    const edgeThreshold = 0.25
    
    // Reset previous folder highlights
    document.querySelectorAll('.drop-target-folder').forEach(el => el.classList.remove('drop-target-folder'))

    if (isFolder && relativeY > height * edgeThreshold && relativeY < height * (1 - edgeThreshold)) {
      // Hovering Middle of Folder -> Drop Inside
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder)
      target.classList.add('drop-target-folder')
      return;
    } 

    if (target.classList.contains('card')) {
       return
    }

    // Insert PlaceHolder
    if (relativeY < height / 2) {
      target.parentNode.insertBefore(placeholder, target)
    } else {
      target.parentNode.insertBefore(placeholder, target.nextSibling)
    }
  }

  function handleDragLeave(e) {
     const target = e.target.closest('.folder')
     if (target) {
       target.classList.remove('drop-target-folder')
     }
  }

  function handleDrop(e) {
    e.preventDefault()
    
    const dropTargetFolder = document.querySelector('.drop-target-folder')
    
    if (dropTargetFolder) {
      // Dropped INTO a folder
      const parentId = dropTargetFolder.dataset.id
      
      // Optimistic Update: Remove from current view as it goes into another folder
      if (dragSource) dragSource.remove()
      
      moveBookmark(dragSourceId, parentId)
    } else if (placeholder.parentNode) {
      // Reordered
      const parentContainer = placeholder.parentNode
      let parentId = null
      
      // Determine new parent ID based on DOM structure
      if (parentContainer.classList.contains('folder')) {
         parentId = parentContainer.dataset.id
      } else if (parentContainer.classList.contains('card') || parentContainer.closest('.card')) {
         const card = parentContainer.closest('.card')
         const currentIdStr = card.dataset.currentId // e.g. "f123"
         parentId = currentIdStr.substring(1) // "123"
      }

      // Calculate new index based on placeholder position
      // Count valid siblings before placeholder, EXCLUDING the item being dragged (if it's a sibling)
      let newIndex = 0
      const siblings = Array.from(parentContainer.children)
      for (const child of siblings) {
        if (child === placeholder) break
        // Skip dragSource in count to simulates "remove then insert" behavior
        if (child !== dragSource && (child.classList.contains('link') || child.classList.contains('folder'))) {
           newIndex++
        }
      }
      
      // Optimistic Update: Move dragSource to placeholder position
      parentContainer.insertBefore(dragSource, placeholder)
      
      moveBookmark(dragSourceId, parentId, newIndex)
    }

    cleanup()
    
    // Refresh Layout
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
         alert('Error moving bookmark')
         // In a real app we might want to revert the optimistic update here on failure
         // For now, reload to sync state if error occurs
         window.location.reload()
         return
       }
       // Success - DOM already updated optimistically
    })
  }
}
