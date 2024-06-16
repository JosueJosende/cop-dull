let bookmarks

export const initMasonry = () => {
  bookmarks = new MiniMasonry({
    container: '.bookmarks',
    baseWidth: 190,
    gutter: 10,
    minify: true,
    ultimateGutter: 15,
    surroundingGutter: true
  })
}

export const reloadMasonry = () => {
  bookmarks.layout()
}
