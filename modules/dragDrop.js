import { reloadMasonry } from './masonry.js'

export function initDragDrop() {
  const container = document.getElementById('bookmarkList')
  let dragSource = null
  let dragSourceId = null
  let placeholder = document.createElement('div')
  placeholder.className = 'drop-placeholder'

  let masonryTimeout = null

  // listeners
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

    // Visuales
    requestAnimationFrame(() => {
      target.classList.add('dragging')
    })
  }

  function handleDragOver(e) {
    e.preventDefault() 
    e.dataTransfer.dropEffect = 'move'

    const target = e.target.closest('.link, .folder, .card')
    if (!target) return

    // Evitar soltar dentro de sí mismo
    if (dragSource && (target === dragSource || dragSource.contains(target))) {
      return
    }

    // Lógica para placeholder vs "soltar dentro de carpeta/card"
    const isFolder = target.classList.contains('folder')
    const isCard = target.classList.contains('card')
    
    // We can drop into a Card (append to root of folder) OR a Folder (subfolder)
    // Only if dragging a Link/Folder (not Card over Card, usually)
    // But allowing Card reorder is good.

    const rect = target.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const height = rect.height
    
    // Umbral: si se está sobre el medio de una CARPETA/CARTA, puede soltar DENTRO?
    // Para marcadores, siempre reordenamos.
    // Para carpetas, podemos reordenar (bordes superior/inferior) o soltar dentro (medio).
    
    const edgeThreshold = 0.25
    
    // Restablecer resaltados de carpetas anteriores
    document.querySelectorAll('.drop-target-folder').forEach(el => el.classList.remove('drop-target-folder'))

    // LOGICA DE SOLTAR DENTRO DE CARPETA
    // Permitir soltar enlace/carpeta DENTRO de otra carpeta/cartel.
    // No se puede soltar una Carta en una Carta (generalmente).
    const draggingCard = dragSource.classList.contains('card')
    
    if (!draggingCard && (isFolder || isCard)) {
       // Si se está sobre el medio -> Soltar Dentro
       if (relativeY > height * edgeThreshold && relativeY < height * (1 - edgeThreshold)) {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder)
          target.classList.add('drop-target-folder')
          return
       }
    }

    // LOGICA DE REORDENAR
    // Si se está arrastrando una Carta, solo se puede reordenar contra Cartas.
    // Si se está arrastrando un Enlace/Carpeta, solo se puede reordenar contra Enlace/Carpeta.
    
    if (draggingCard && !isCard) return // No se puede reordenar una Carta contra un Enlace
    if (!draggingCard && isCard) return // No se puede reordenar un Enlace contra una Carta (desacuerdo en la jerarquía visual)
    
    // Insertar PlaceHolder
    if (relativeY < height / 2) {
      target.parentNode.insertBefore(placeholder, target)
    } else {
      target.parentNode.insertBefore(placeholder, target.nextSibling)
    }

    // Acelerar la disposición de la masonry para una experiencia más suave
    // Solo necesario si el arrastre causa un desplazamiento de la disposición (por ejemplo, arrastrar una tarjeta, o agregar un marcador cambia la altura)
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
    
    // SOLTAR DENTRO DE CARPETA
    if (dropTargetFolder) {
      // Usa dataset.id para carpetas, pero para tarjetas necesitamos el ID de la carpeta que representa.
      // Las tarjetas tienen dataset.id (que es el ID de la carpeta).
      const parentId = dropTargetFolder.dataset.id
      
      if (dragSource) dragSource.remove()
      moveBookmark(dragSourceId, parentId) // Añade al final
    } 
    // REORDENAR
    else if (placeholder.parentNode) {
      const parentContainer = placeholder.parentNode
      let parentId = null
      
      // Determinar ID correcto del padre
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

      // Calcular índice
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
      // La verificación de igualdad estricta puede fallar si los tipos difieren (cadena vs. int en el conjunto de datos si no hay coincidencia manual/API)
      // Generalmente el conjunto de datos es cadena. La API devuelve cadenas.
      if (sourceParentId == parentId && isMovingDown) {
          newIndex++
      }
      
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

    browser.bookmarks.move(id, destination, (result) => {
       if (browser.runtime.lastError) {
         console.error(browser.runtime.lastError.message)
         // window.location.reload() // O mostrar error
       }
    })
  }
}
