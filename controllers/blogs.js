const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (err) {
    next(err)
  }

})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  }
  catch(error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const token = request.token 
  try {
    const decodedToken = jwt.verify(token, 'secret')  
    if (!token || !decodedToken.id) {    
      return response.status(401).json({ error: 'token missing or invalid' })  
    }  
  
  const body = request.body

  if(!body.author || !body.title) {
    return response.status(400).end("Bad Request")
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id
  })

    savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)  
    await user.save()
    response.json(savedBlog)
  }
  catch(exception) {
    next(exception)
  } 
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(token, 'secret')  
    if (!token || !decodedToken.id) {    
      return response.status(401).json({ error: 'token missing or invalid' })  
    }  
    const blog = await Blog.findById(request.params.id)
    if(blog.user.toString() === decodedToken.id.toString()) {
      await Blog.remove({_id: blog.id})
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'user not allowed to delete this blog' })
    }
  }catch(error) {
    next(error)
  } 
})

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})

module.exports = blogsRouter