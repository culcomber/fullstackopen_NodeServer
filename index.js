const express = require("express");
const app = express();
const requestLogger = (request, response, next) => { // 打印出发送到服务器的每个请求的信息
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next() // 将控制权交给下一个中间件
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// 中间件函数的调用顺序是它们被 Express 服务器对象的 use 方法所使用的顺序
app.use(express.json()) // 将请求的 JSON 数据转化为 JavaScript 对象
app.use(requestLogger)

let notes = [
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
];

// request包含 HTTP 请求的所有信息，response定义如何对请求进行响应
app.get("/", (request, response) => {
  // Express 自动将 Content-Type 头的值设置为 text/html。响应的状态代码默认为 200
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  // Express 自动将 Content-Type 头设置为 application/json 的适当值
  response.json(notes);
});

// Fetching a single resource
app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    // 使用 status 方法来设置状态，并使用 end 方法来响应请求，而不发送任何数据。
    response.status(404).end();
  }
});

// Receiving data
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id)) // 找到当前最大id
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }
  notes = notes.concat(note)
  response.json(note)
})

// Deleting resources
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint) // 未定义路由

// const PORT = 3001;
const PORT = process.env.PORT || 3001 //port 號會由 Heroku 給予，因此不再自行指定
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
