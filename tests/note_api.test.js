const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app) // 从app.js模块中导入Express应用，并将其与supertest函数包装成一个所谓的superagent对象
const Note = require('../models/note')

/*初始化数据库
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
]*/
beforeEach(async () => {
  await Note.deleteMany({})
  // let noteObject = new Note(initialNotes[0])
  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()
  // noteObject = new Note(initialNotes[1])
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})

// --------------------------查询get('/api/notes')------------------------
// api对象的方法调用前面有await关键字
// Jest默认的5000ms的测试超时，第三个参数将超时设置为100000毫秒。确保测试不会因为运行时间而失败
test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  /*    expect(response.body).toHaveLength(2)
  expect(response.body).toHaveLength(initialNotes.length)*/
  expect(response.body).toHaveLength(helper.initialNotes.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  // expect(response.body[0].content).toBe('HTML is easy')
  const contents = response.body.map(r => r.content)
  expect(contents).toContain(
    'Browser can execute only Javascript'
  )
})

// --------------------------新增post('/api/notes')------------------------
test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }
  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  /*  const response = await api.get('/api/notes')
  const contents = response.body.map(r => r.content)
  expect(response.body).toHaveLength(initialNotes.length + 1)*/
  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
  const contents = notesAtEnd.map(n => n.content)
  expect(contents).toContain(
    'async/await simplifies making async calls'
  )
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }
  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  /*  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNotes.length)*/
  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

// --------------------------查询单个笔记get(`/api/notes/${noteToView.id}`)------------------------
test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]
  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
  expect(resultNote.body).toEqual(processedNoteToView)
})

// --------------------------删除笔记delete(`/api/notes/${noteToView.id}`)------------------------
test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb() // 查询数据库全部笔记
  const noteToDelete = notesAtStart[0] // 删除第一个笔记
  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb() // 查询删除第一个笔记之后的全部笔记
  expect(notesAtEnd).toHaveLength(
    helper.initialNotes.length - 1
  )
  const contents = notesAtEnd.map(r => r.content)
  expect(contents).not.toContain(noteToDelete.content)
})

// 所有的测试都运行完毕，须关闭Mongoose使用的数据库连接
afterAll(() => {
  mongoose.connection.close()
})