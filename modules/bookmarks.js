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
      cardElement.id = `c${cards[card][0].id}`
      cardElement.innerHTML = `<div class="card-header">
        <div class="title h2">
          <span class="name">${cards[card][0].title}</span
        </div>`

      /* const content = (fill, parentElement, isFolder) => {
        // console.log('folder')
        Object.entries(fill.children).forEach(([key, node]) => {
          if (node.children) {
            console.log(node.title)
            // is folder
            const folder = document.createElement('div')
            folder.classList.add('folder')
            // folder.classList.add(parentElement.id)
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
      } */

      content(child, cardElement, false)
      list.appendChild(cardElement)
    }
  }

  initMasonry()

  const $ = (el) => document.querySelector(el)
  const $$ = (el) => document.querySelectorAll(el)

  const folders = $$('.folder')
  const titles = $$('.h2')

  folders.forEach((folder) => folder.addEventListener('click', (e) => handleFolderClick(e), { once: true }))
  titles.forEach((title) => title.addEventListener('click', (e) => backTo(e)))
}

const content = (fill, parentElement, isFolder) => {
  Object.entries(fill.children).forEach(([key, node]) => {
    if (node.children) {
      // is folder
      const folder = document.createElement('div')
      folder.classList.add('folder')
      folder.classList.add(`f${fill.id}`)
      folder.id = `f${node.id}`

      if (isFolder) folder.style.display = 'none'

      folder.innerHTML = `<div class="folder-title f${fill.id}">${node.title}</div>`

      parentElement.appendChild(folder)

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

const getFavicon = async (url) => {}

const addFolder = (folder, parentElement) => {}

const addBookmark = (bookmark, parentElement) => {}

const backTo = (e) => {
  console.log(e)
  if (e.target.classList[0] === 'name' || e.target.classList[0] === 'title') {
    return
  }

  let [currentFolder, parentFolder] = e.target.classList

  currentFolder = currentFolder.replace('h', 'f')
  parentFolder = parentFolder.replace('h', 'f')

  // console.log(currentFolder, parentFolder)

  document.querySelectorAll(`.${parentFolder}`).forEach((el) => (el.style.display = 'none'))
  document.querySelectorAll(`.${currentFolder}`).forEach((el) => (el.style.display = 'flex'))

  reloadMasonry()
}

const addFolderTitle = (idHeader, nameFolder, currentFolder, parentFolder) => {
  const titleHeader = document.querySelector(`#${idHeader} .card-header .h2`)

  const span = document.createElement('span')
  span.classList.add(parentFolder.replace('f', 'h'))
  span.classList.add(currentFolder.replace('f', 'h'))
  span.textContent = ' / ' + nameFolder
  titleHeader.appendChild(span)
}

let idHeader

const handleFolderClick = (e) => {
  const folder = e.target.parentElement
  const nameFolder = e?.target?.textContent
  const currentFolder = folder.id

  let parentFolder = folder.parentElement.id

  if (parentFolder.at(0) === 'c') {
    idHeader = parentFolder
    parentFolder = parentFolder.replace('c', 'f')
  }

  addFolderTitle(idHeader, nameFolder, currentFolder, parentFolder)

  document.querySelectorAll(`.${parentFolder}`).forEach((el) => (el.style.display = 'none'))
  document.querySelectorAll(`.${currentFolder}`).forEach((el) => (el.style.display = 'flex'))
  folder.style.display = 'flex'
  folder.style.flexDirection = 'column'

  reloadMasonry()
}
