const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Note = require('./models/note') // 使用数据库模型

const requestLogger = (request, response, next) => {
  // 打印出发送到服务器的每个请求的信息
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next() // 将控制权交给下一个中间件
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// 中间件函数的调用顺序是它们被 Express 服务器对象的 use 方法所使用的顺序
app.use(cors())
app.use(express.json()) // 将请求的 JSON 数据转化为 JavaScript 对象
app.use(requestLogger)
app.use(express.static('build')) // 每当express收到一个HTTP GET请求时，它将首先检查build目录中是否包含一个与请求地址相对应的文件。

/*let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-05-30T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-05-30T18:39:34.091Z",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-05-30T19:20:14.298Z",
    important: true,
  },
];*/

/*request包含 HTTP 请求的所有信息，response定义如何对请求进行响应
app.get('/', (request, response) => {
  // Express 自动将 Content-Type 头的值设置为 text/html。响应的状态代码默认为 200
  response.send("<h1>Hello World!</h1>");
});*/

app.get('/api/notes', (request, response) => {
  // Express 自动将 Content-Type 头设置为 application/json 的适当值
  // response.json(notes);

  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

// Receiving data
/*const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id)) // 找到当前最大id
    : 0
  return maxId + 1
}*/

app.post('/api/notes', (request, response, next) => {
  /*if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }
  notes = notes.concat(note)
  response.json(note)*/

  const body = request.body
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error)) // 如果没有数或者数据不符合规则，交给下个中间件errorHandler处理
})

// Fetching a single resource
app.get('/api/notes/:id', (request, response, next) => {
  /*const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    // 使用 status 方法来设置状态，并使用 end 方法来响应请求，而不发送任何数据。
    response.status(404).end();
  }*/

  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

// Deleting resources
app.delete('/api/notes/:id', (request, response, next) => {
  /*const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()*/

  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint) // 未定义路由
app.use(errorHandler) // 错误处理

// const PORT = 3001;
const PORT = process.env.PORT || 3001 //port 號會由 Heroku 給予，因此不再自行指定
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
