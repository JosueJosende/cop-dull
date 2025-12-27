import { initMasonry, reloadMasonry } from './masonry.js'
import { folderColor } from './settings.js'

export async function displayBookmarks(nodes) {
  const mainOnly = nodes[0].children[0].children

  const cards = Object.groupBy(mainOnly, ({ title }) => {
    return title
  })

  const list = document.getElementById('bookmarkList')
  list.innerHTML = '' // Clear list if needed

  for (const card in cards) {
    const child = cards[card][0]
    
    if (child.children) {
      // Create a card for each title
      const cardElement = document.createElement('div')
      cardElement.classList.add('card')
      cardElement.id = `c${child.id}`
      cardElement.dataset.title = child.title
      cardElement.dataset.currentId = `f${child.id}`
      cardElement.dataset.id = child.id
      cardElement.dataset.parentId = child.parentId

      // SVG for Back Button
      const backSvg = `<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>`

      cardElement.innerHTML = `
        <div class="card-header">
          <div class="title h2">
            <span class="name">${child.title}</span>
          </div>
          <div class="back-button" style="display: none;" title="Go Back">
            ${backSvg}
          </div>
        </div>`

      content(child, cardElement, false)
      list.appendChild(cardElement)
      
      requestAnimationFrame(() => {
        cardElement.classList.add('visible')
      })
    }
  }

  initMasonry()

  // Event Listeners
  const folders = document.querySelectorAll('.folder')
  folders.forEach((folder) => folder.addEventListener('click', handleFolderClick))

  const backButtons = document.querySelectorAll('.back-button')
  backButtons.forEach(btn => btn.addEventListener('click', goBack))
}

const content = (fill, parentElement, isFolder) => {
  Object.entries(fill.children).forEach(([key, node]) => {
    if (node.children) {
      // is folder
      const folder = document.createElement('div')
      folder.classList.add('folder')
      folder.classList.add(`f${fill.id}`) // Class to identify siblings
      folder.id = `f${node.id}`
      folder.dataset.id = node.id
      folder.dataset.parentId = node.parentId
      folder.dataset.title = node.title
      folder.draggable = true

      if (isFolder) folder.style.display = 'none'

      folder.innerHTML = `<div class="folder-title f${fill.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${folderColor}"><path d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z" /></svg>
        <span>${node.title}</span>
      </div>`

      parentElement.appendChild(folder)

      content(node, folder, true)
    } else {
      const link = document.createElement('div')
      link.dataset.id = node.id
      link.dataset.parentId = node.parentId
      link.draggable = true
      link.classList.add('link')
      link.classList.add(parentElement.id.replace('c', 'f')) 
      
      if (isFolder) link.style.display = 'none'

      const img = document.createElement('img')
      img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${node.url}`

      const a = document.createElement('a')
      a.href = node.url
      a.textContent = node.title

      link.appendChild(img)
      link.appendChild(a)

      parentElement.appendChild(link)
    }
  })
}



const handleFolderClick = (e) => {
  e.stopPropagation()
  const folder = e.currentTarget
  const card = folder.closest('.card')

  if (card.dataset.currentId === folder.id) return

  const newId = folder.id 
  const newName = folder.dataset.title
  const currentDisplayedId = card.dataset.currentId 

  console.log(`[Enter] From: ${currentDisplayedId} To: ${newId} (${newName})`)

  // 1. Hide Current Items (Siblings)
  const currentItems = card.querySelectorAll(`.${currentDisplayedId}`)
  currentItems.forEach(el => {
      if (el === folder) return 
      el.style.display = 'none'
  })

  // 2. Prepare Target Folder (Container)
  // We use setProperty to ensure priority
  folder.style.setProperty('display', 'flex', 'important')
  folder.style.setProperty('flex-direction', 'column', 'important')
  folder.style.width = '100%'
  folder.style.height = 'auto'
  folder.style.cursor = 'default' 
  folder.style.position = 'relative'

  // 3. Show Children
  let found = 0
  const children = Array.from(folder.children)
  children.forEach(child => {
      if (child.classList.contains('folder-title')) {
          child.style.display = 'none'
      } else {
          child.style.setProperty('display', 'flex', 'important')
          child.style.width = '100%'
          
          if (child.classList.contains('folder')) {
            child.style.flexDirection = 'column'
            child.style.cursor = 'pointer'
            
            // Ensure sub-folder titles are visible
            const subTitle = child.querySelector('.folder-title')
            if (subTitle) subTitle.style.display = 'flex'
          }
          found++
      }
  })
  console.log(`[Enter] Children toggled: ${found}`)

  // 4. Update Header
  const titleSpan = card.querySelector('.card-header .title .name')
  titleSpan.textContent = newName

  // 5. Show Back Button
  const backBtn = card.querySelector('.back-button')
  backBtn.style.display = 'flex'

  // 6. Update State
  card.dataset.currentId = newId
  
  // 7. Recalculate Layout
  // Use a timeout to allow DOM to settle and styles to apply before measuring height
  setTimeout(() => {
    card.style.height = 'auto'
    const h = card.scrollHeight
    console.log(`New Card Height: ${h}`)
    card.style.height = h + 'px'
    reloadMasonry()
  }, 50)
}

const goBack = (e) => {
  e.stopPropagation()
  const btn = e.currentTarget
  const card = btn.closest('.card')
  
  const currentId = card.dataset.currentId
  const currentFolderDiv = document.getElementById(currentId)
  
  if (!currentFolderDiv) { console.error("Current folder div not found!"); return; }

  const parentContainer = currentFolderDiv.parentElement
  const parentId = parentContainer.id
  
  // Determine Destination
  let destId = ''
  let destTitle = ''
  let showBack = true
  
  if (parentId.startsWith('c')) {
    destId = 'f' + parentId.substring(1) 
    destTitle = card.dataset.title
    showBack = false
  } else {
    destId = parentId 
    destTitle = parentContainer.dataset.title
  }
  
  console.log(`[Back] From: ${currentId} To: ${destId}`)

  // 1. Hide Current Items (Children of the folder we are leaving)
  const currentItems = card.querySelectorAll(`.${currentId}`)
  currentItems.forEach(el => el.style.display = 'none')
  
  // 2. Hide/Reset the Container Folder we are leaving
  // It needs to look like a button/folder item again.
  currentFolderDiv.style.width = ''
  currentFolderDiv.style.cursor = 'pointer'
  
  // Re-show the title of the folder we are leaving, since it is now just an item
  const internalTitle = currentFolderDiv.querySelector('.folder-title')
  if (internalTitle) internalTitle.style.display = 'flex'
  
  // 3. Show Destination Items (Siblings of the folder we just left)
  const destItems = card.querySelectorAll(`.${destId}`)
  destItems.forEach(el => {
    el.style.setProperty('display', 'flex', 'important')
    // If it's a folder (including the one we just left), ensure it looks right
    if(el.classList.contains('folder')) {
      el.style.flexDirection = 'column' 
      el.style.width = '100%' 
      
      // Ensure their titles are visible (logic above handles the specific one we left, but good to be safe)
      const t = el.querySelector('.folder-title')
      if(t) t.style.display = 'flex'
    }
  })
  
  // 4. Update Header
  const titleSpan = card.querySelector('.card-header .title .name')
  titleSpan.textContent = destTitle
  
  // 5. Update Back Button
  if (!showBack) {
    btn.style.display = 'none'
  }
  
  // 6. Update State
  card.dataset.currentId = destId
  
  // 7. Layout
  setTimeout(() => {
     card.style.height = 'auto'
     card.style.height = card.scrollHeight + 'px'
     reloadMasonry()
  }, 50)
}

