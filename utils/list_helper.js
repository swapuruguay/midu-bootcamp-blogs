const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(b => b.likes)
  return  likes.reduce((sum, item) => sum + item, 0)
}

const favouriteBlog = (blogs) => {
  const maxL = blogs.length > 0
  ? Math.max(...blogs.map(b => b.likes)) 
  : 0

  if(blogs.length === 0) {
    return {}
  }

  const maxBlogs = blogs.filter(b => b.likes === maxL)
  const listReduced = maxBlogs.map(b => ({title: b.title, author: b.author, likes: b.likes}))
  
  return listReduced[0]
}


const mostBlogs = (blogs) => {
  if(blogs.length === 0) return {}
  const authors = []
  blogs.forEach((b, i) => {
    const objAuthor = authors.find(a => a.author === b.author)
    if(objAuthor) {
     objAuthor.cant = objAuthor.cant + 1
    } else {
      const newAuthor = {author: b.author, cant: 1}
      authors.push(newAuthor)
     }
  })
  authors.sort((a, b) => b.cant - a.cant)
  const retorno = {author: authors[0].author, blogs: authors[0].cant}
  return retorno

}

const mostLikes = (blogs) => {
  if(blogs.length === 0) return {}
  const authors = []
  blogs.forEach((b, i) => {
    const objAuthor = authors.find(a => a.author === b.author)
    if(objAuthor) {
     objAuthor.likes = objAuthor.likes + b.likes
    } else {
      const newAuthor = {author: b.author, likes: b.likes}
      authors.push(newAuthor)
     }
  })
  authors.sort((a, b) => b.likes - a.likes)
  const retorno = {author: authors[0].author, likes: authors[0].likes}
  return retorno

}



module.exports = {dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes}