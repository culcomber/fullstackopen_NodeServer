const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app) // 从app.js模块中导入Express应用，并将其与supertest函数包装成一个所谓的superagent对象

// 初始化数据库
const Note = require('../models/note')
const initialNotes = [
  {
    content: 'HTML is easy',
    date: new Date(),
    important: false,
  },
  {
    content: 'Browser can execute only Javascript',
    date: new Date(),
    important: true,
  },
]
beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(initialNotes[0])
  await noteObject.save()
  noteObject = new Note(initialNotes[1])
  await noteObject.save()
})


// api对象的方法调用前面有await关键字
// Jest默认的5000ms的测试超时，第三个参数将超时设置为100000毫秒。确保测试不会因为运行时间而失败
test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('there are two notes', async () => {
  const response = await api.get('/api/notes')
  //   expect(response.body).toHaveLength(2)
  expect(response.body).toHaveLength(initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')
  // expect(response.body[0].content).toBe('HTML is easy')
  const contents = response.body.map(r => r.content)
  expect(contents).toContain(
    'Browser can execute only Javascript'
  )
})

// 所有的测试都运行完毕，须关闭Mongoose使用的数据库连接
afterAll(() => {
  mongoose.connection.close()
})