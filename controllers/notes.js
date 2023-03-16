const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// 获取token
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('bearer ')) {
    return authorization.replace('bearer ', '')
  }
  return null
}

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

// app.js app.use('/api/notes', notesRouter)
notesRouter.get('/:id', async (request, response) => {
  /*Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))*/
  /*try {
    const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }*/
  // 在async路由中发生异常，执行会自动传递给错误处理中间件
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response) => {
  const body = request.body

  // const user = await User.findById(body.userId)
  const authorization = getTokenFrom(request)
  const decodedToken = jwt.verify(authorization, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    user: user._id
  })

  /*  note.save()
    .then(savedNote => {
      response.status(201).json(savedNote)
    })
    .catch(error => next(error))*/
  const savedNote = await note.save()
  // 用户端也要保存笔记
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  /*  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))*/
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  const body = request.body
  const note = {
    content: body.content,
    important: body.important,
  }

  /*Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))*/
  const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
  response.json(updatedNote)
})

module.exports = notesRouter