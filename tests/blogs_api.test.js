const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)


const Blog = require('../models/blog')
const User = require('../models/user')
const initialBlogs = [  
  {
    title: 'Title 1',    
    author: 'Author 1',
    url: 'http://example.com',
    likes: 1
  },
  {
    title: 'Title 2',    
    author: 'Author 2',
    url: 'http://anotherexample.com',
    likes: 1
  }
]

beforeEach(async () => {

  await Blog.deleteMany({})  
  let user = await User.findOne({username: 'root'})
  let blogWithUser = {...initialBlogs[0]}
  blogWithUser.user = user._id
  let blogObject = new Blog(blogWithUser)  
  await blogObject.save()
  blogWithUser = {...initialBlogs[1]}
  blogWithUser.user = user._id
  blogObject = new Blog(blogWithUser)  
  await blogObject.save()
})

describe('when there is initially some notes saved', () => {

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body.map(({title, author, url, likes}) => ({title, author, url, likes}))
    expect(blogs[0]).toEqual(initialBlogs[0])
  })

  test('unique identifier property', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    blogs.map(b => b.toJSON)
    expect(blogs[0].id).toBeDefined()
  })

})
describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    let res = await api.get('/api/blogs')
    const blogs = res.body
    const blogToFind = {...blogs[0], user: blogs[0].user.id}
    res = await api.get(`/api/blogs/${blogToFind.id}`)
    const oneBlog = res.body
    expect(oneBlog).toEqual(blogs[0])
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const id = '60ce554bb7339cf1df3e2499'
    await api
      .get(`/api/blogs/${id}`)
      .expect(404)
      
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const id = 'idInvalido'
    await api
      .get(`/api/blogs/${id}`)
      .expect(400)
      
  })
})
describe('addition of a new note', () => {
  test('a valid blog can be added ', async () => {
    const res = await api
      .post('/api/login')
      .send({username: 'root', password: 'sekret'})
    const token = res.body.token
    const newBlog = {
      title: 'Title new',    
      author: 'Author new',
      url: 'http://examplenew.com',
      likes: 2
    }
    await api
      .post('/api/blogs')
      .set({Authorization: `bearer ${token}`, Accept: 'application/json'})
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogsAtEnd = response.body
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    const title = blogsAtEnd.map(n => n.title)  
    expect(title).toContain(
      'Title new'
    )
  })

  test('a valid blog can\'t be added if not token provided', async () => {
    
    const newBlog = {
      title: 'Title new',    
      author: 'Author new',
      url: 'http://examplenew.com',
      likes: 2
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const response = await api.get('/api/blogs')
    const blogsAtEnd = response.body
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('a blog without likes then likes 0', async () => {
    const newBlog = {
      title: 'Title new',    
      author: 'Author new',
      url: 'http://examplenew.com'
    }

    const res = await api
      .post('/api/login')
      .send({username: 'root', password: 'sekret'})
    const token = res.body.token
    

    const resp = await api
      .post('/api/blogs')
      .set({Authorization: `bearer ${token}`, Accept: 'application/json'})
      .send(newBlog)
    
    expect(resp.body.likes).toBe(0)

  })

  test('a blog without title or author response 400', async () => {
    const newBlog = {
      url: 'http://examplenew.com',
      likes: 5
    }

    const res = await api
      .post('/api/login')
      .send({username: 'root', password: 'sekret'})
    const token = res.body.token

    await api
      .post('/api/blogs')
      .set({Authorization: `bearer ${token}`, Accept: 'application/json'})
      .send(newBlog)
      .expect(400)
    
    const resp = await api.get('/api/blogs')
    const blogsAtEnd = resp.body
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })
})

describe('update of a blog', () => {
  test('blogs likes are updated', async () => {
    let res = await api.get('/api/blogs')
      const blogs = res.body
      const blogToUpdate = blogs[0]
  
      const respuesta = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({likes: 20})
        .expect(200)
  
      expect(respuesta.body.likes).toBe(20)

      res = await api.get('/api/blogs')
      const blogsAtEnd = res.body
      expect(blogsAtEnd).toHaveLength(blogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    let resp = await api.get('/api/blogs')
    const blogsAtStart = resp.body
    const blogToDelete = blogsAtStart[0]

    const res = await api
      .post('/api/login')
      .send({username: 'root', password: 'sekret'})
    const token = res.body.token
    blogToDelete.user= res.body.id
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({Authorization: `bearer ${token}`, Accept: 'application/json'})
      .expect(204)

    resp = await api.get('/api/blogs')
    const blogsAtEnd = resp.body

    expect(blogsAtEnd).toHaveLength(
      initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})


afterAll(() => {
  mongoose.connection.close()
})