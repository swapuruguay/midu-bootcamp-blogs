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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  usersInDb,
}