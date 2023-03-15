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
  /* let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()*/

  await Note.deleteMany({})

  /*forEach循环的每个迭代都会产生自己的异步操作，而beforeEach不会等待它们执行完毕
  在forEach循环内部定义的await命令不在beforeEach函数中
  helper.initialNotes.forEach(async (note) => {
    let noteObject = new Note(note)
    await noteObject.save()
  })*/
  const noteObjects = helper.initialNotes.map(note => new Note(note)) // 创建分配给一个Mongoose对象数组
  const promiseArray = noteObjects.map(note => note.save()) // promise数组，用于将每个项目保存到数据库中
  await Promise.all(promiseArray) // 等待每个保存笔记的承诺完成
  // 保证顺序
  /*for (let note of helper.initialNotes) {
    let noteObject = new Note(note)
    await noteObject.save()
  }*/
  // 使用插件提供方法
  // await Note.insertMany(helper.initialNotes)
})

// --------------------------查询get('/api/notes')------------------------
describe('when there is initially some notes saved', () => {
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
})

// --------------------------查询单个笔记get(`/api/notes/${noteToView.id}`)------------------------
describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    expect(resultNote.body).toEqual(processedNoteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})

// --------------------------新增post('/api/notes')------------------------
describe('addition of a new note', () => {
  test('succeeds with valid data', async () => {
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

  test('fails with status code 400 if data invalid', async () => {
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
})

// --------------------------删除笔记delete(`/api/notes/${noteToView.id}`)------------------------
describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
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
})

// 所有的测试都运行完毕，须关闭Mongoose使用的数据库连接
afterAll(() => {
  mongoose.connection.close()
})