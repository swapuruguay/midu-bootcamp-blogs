const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const user = await User.findOne({username: body.username})

    const passwordCheck = user === null ? false : await bcrypt.compare(body.password, user.passwordHash)
    if(!(user && passwordCheck)) {
      return response.status(401).json({error: 'Invalid username or password'})
    }

    const userForToken = {
      username: user.username,
      id: user._id
    }

    const token = jwt.sign(userForToken, 'secret')
  
     
    response
      .status(200)
      .send({token, username: user.username, name: user.name})

  } catch (err) {
    next(err)
  }
})

module.exports = loginRouter