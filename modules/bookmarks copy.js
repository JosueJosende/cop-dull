import { initMasonry, reloadMasonry } from './masonry.js'

export async function displayBookmarks(nodes) {
  const mainOnly = nodes[0].children[0].children

  const cards = Object.groupBy(mainOnly, ({ title }) => {
    return title
  })

  for (const card in cards) {
    const child = cards[card][0]
    const list = document.getElementById('bookmarkList')

    if (child.children) {
      // Create a card for each title
      const cardElement = document.createElement('div')
      cardElement.classList.add('card')
      cardElement.id = `f${cards[card][0].id}`
      cardElement.innerHTML = `<div class="card-header">
        <h2 class="title">
          ${cards[card][0].title}
        </h2>`

      const content = (fill, parentElement, isFolder) => {
        // console.log('folder')
        Object.entries(fill.children).forEach(([key, node]) => {
          if (node.children) {
            console.log(node.title)
            // is folder
            const folder = document.createElement('div')
            folder.classList.add('folder')
            /* folder.classList.add(parentElement.id) */
            folder.id = `f${node.id}`
            if (isFolder) folder.style.display = 'none'

            folder.innerHTML = `<div class="folder-title f${cards[card][0].id}">${node.title}</div>`

            if (isFolder) {
              parentElement.appendChild(folder)
            } else {
              cardElement.appendChild(folder)
            }

            content(node, folder, true)
          } else {
            // console.log('link')
            const link = document.createElement('div')
            link.classList.add('link')
            link.classList.add(parentElement.id)
            if (isFolder) link.style.display = 'none'

            const img = document.createElement('img')
            img.src = `https://s2.googleusercontent.com/s2/favicons?domain=${node.url}`
            // img.alt = node.title

            const a = document.createElement('a')
            a.href = node.url
            a.textContent = node.title

            link.appendChild(img)
            link.appendChild(a)

            parentElement.appendChild(link)
          }
        })
      }

      content(child, cardElement, false)
      list.appendChild(cardElement)
    }
  }

  initMasonry()

  const $ = (el) => document.querySelector(el)
  const $$ = (el) => document.querySelectorAll(el)

  const folders = $$('.folder')

  folders.forEach((folder) => {
    console.log(folder)
    folder.addEventListener('click', handleFolderClick)
  })
}

const getFavicon = async (url) => {}

const addFolder = (folder, parentElement) => {}

const addBookmark = (bookmark, parentElement) => {}

const handleFolderClick = (e) => {
  const folder = e.target.parentElement
  const nameFolder = e.target.textContent
  const currentFolder = folder.id
  /* const parentFolder = folder.classList[1] */
  const parentFolder = folder.parentElement.id

  const header = document.getElementById(parentFolder).querySelector('.card-header h2')
  header.textContent = header.textContent + '/ ' + nameFolder

  document.querySelectorAll(`.${parentFolder}`).forEach((el) => {
    el.style.display = 'none'
  })
  document.querySelectorAll(`.${currentFolder}`).forEach((el) => {
    el.style.display = 'flex'
  })

  reloadMasonry()

  console.log({
    header: header,
    nameFolder: nameFolder,
    currentFolder: currentFolder,
    parentFolder: parentFolder
  })
  /*

  if (folderContent.style.display === 'none') {
    folderContent.style.display = 'block'
  } else {
    folderContent.style.display = 'none'
  } */
}
