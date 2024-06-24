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

      content(child, cardElement, false)
      list.appendChild(cardElement)
      requestAnimationFrame(() => {
        cardElement.classList.add('visible')
      })
    }
  }

  initMasonry()

  const $$ = (el) => document.querySelectorAll(el)

  const folders = $$('.folder')
  const titles = $$('.h2')

  folders.forEach((folder) => folder.addEventListener('click', (e) => handleFolderClick(e) /* , { once: true } */))
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
      const link = document.createElement('div')
      link.classList.add('link')
      link.classList.add(parentElement.id.replace('c', 'f')) // parentElement.id
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

const getFavicon = async (url) => {}

const addFolder = (folder, parentElement) => {}

const addBookmark = (bookmark, parentElement) => {}

const backTo = (e) => {
  if (e.target.classList[0] === 'name' || e.target.classList[0] === 'title') {
    return
  }

  let [currentFolder, parentFolder, idHeader] = e.target.classList

  currentFolder = currentFolder.replace('h', 'f')
  parentFolder = parentFolder.replace('h', 'f')

  document.querySelectorAll(`.${parentFolder}`).forEach((el) => (el.style.display = 'none'))
  document.querySelector(`#${parentFolder}`).style.height = 'auto'

  document.querySelectorAll(`.${currentFolder}`).forEach((el) => (el.style.display = 'flex'))

  const heightCard = document.querySelector(`#${idHeader}`)
  heightCard.style.height = 'auto'
  heightCard.style.height = heightCard.scrollHeight + 'px'

  reloadMasonry()
  e.target.remove()
}

const addFolderTitle = (idHeader, nameFolder, currentFolder, parentFolder, card) => {
  const titleHeader = document.querySelector(`#${idHeader} .card-header .h2`)

  const span = document.createElement('span')
  span.classList.add(parentFolder.replace('f', 'h'))
  span.classList.add(currentFolder.replace('f', 'h'))
  span.style.cursor = 'pointer'
  span.style.fontWeight = 400
  span.style.letterSpacing = '0.05rem'
  span.classList.add(idHeader)
  /* span.setAttribute('card', card) */
  span.textContent = '/' + nameFolder
  titleHeader.appendChild(span)
}

let element = null
let idHeader

const handleFolderClick = (e) => {
  if (element !== e.target) {
    element = e.target
    const folder = e.target.parentElement
    const nameFolder = e?.target?.textContent
    const currentFolder = folder.id

    let parentFolder = folder.parentElement.id
    const card = parentFolder

    if (parentFolder.at(0) === 'c') {
      idHeader = parentFolder
      parentFolder = parentFolder.replace('c', 'f')
    }

    addFolderTitle(idHeader, nameFolder, currentFolder, parentFolder, card)

    document.querySelectorAll(`.${parentFolder}`).forEach((el) => (el.style.display = 'none'))

    document.querySelectorAll(`.${currentFolder}`).forEach((el) => (el.style.display = 'flex'))
    document.querySelector(`#${currentFolder}`).style.height = 'auto'

    folder.style.display = 'flex'
    folder.style.flexDirection = 'column'

    const heightCard = document.querySelector(`#${idHeader}`)
    heightCard.style.height = 'auto'
    heightCard.style.height = heightCard.scrollHeight + 'px'

    reloadMasonry()
  } else {
    element = null
  }
}
