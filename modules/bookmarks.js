export async function displayBookmarks(nodes) {
  const mainOnly = nodes[0].children[0].children

  const cards = Object.groupBy(mainOnly, ({ title }) => {
    return title
  })

  for (const card in cards) {
    const child = cards[card][0]
    const list = document.getElementById('bookmarkList')

    const cardElement = document.createElement('div')

    // convierte el string en minusculas y elimina los espacios

    if (child.children) {
      // Create a card for each title
      cardElement.classList.add('card')
      cardElement.id = cards[card][0].id
      cardElement.innerHTML = `<div class="card-header">
        <h2 class="title" data-target="#${cards[card][0].id}" aria-controls="${cards[card][0].id}">
          ${cards[card][0].title}
        </h2>`

      const content = (fill, parentElement, isFolder) => {
        Object.entries(fill.children).forEach(([key, node]) => {
          if (node.children) {
            // is folder
            const folder = document.createElement('div')
            folder.classList.add('folder')
            folder.classList.add(parentElement.id)
            folder.id = node.id
            if (isFolder) folder.style.display = 'none'

            folder.innerHTML = `<div class="folder-content"><img src="./assets/folder.png" style="height: 16px;"><span>${node.title}<span></div>`

            cardElement.appendChild(folder)

            content(node, folder, true)
          } else {
            console.log('...')
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
    }
    list.appendChild(cardElement)
  }

  const bookmarks = new MiniMasonry({
    container: '.bookmarks',
    baseWidth: 190,
    gutter: 10,
    minify: true,
    ultimateGutter: 15,
    surroundingGutter: true
  })

  bookmarks.layout()
}

const getFavicon = async (url) => {}

const addFolder = (folder, parentElement) => {}

const addBookmark = (bookmark, parentElement) => {}
