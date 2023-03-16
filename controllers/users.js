const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// 查找用户
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

// 新增用户
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  // 名字不能重复检查
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  // 处理密码
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter