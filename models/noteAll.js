const mongoose = require('mongoose')

// 为 "true "时，Mongoose将确保只有在你的模式中指定的字段才会被保存到数据库中，而所有其他字段将不会被保存
// In Mongoose 7, strictQuery is false by default
mongoose.set('strictQuery', false)

// eslint-disable-next-line no-undef
const url = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: 5,
    required: true,
  },
  important: Boolean,
})

// Exactly the same as the toObject option but only applies when the document's toJSON method is called
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Note', noteSchema)
