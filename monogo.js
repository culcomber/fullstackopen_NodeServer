const mongoose = require('mongoose')

// if (process.argv.length<3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]
// const url =
//     'mongodb+srv://SamTL:opjnFhX4ADLR1Smr@cluster0.xauoi5d.mongodb.net/?retryWrites=true&w=majority'

const url =
  'mongodb+srv://SamTL:ziDRCvn5PeiaiyG8@cluster0.uvewpvt.mongodb.net/?retryWrites=true&w=majority'

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'CSS is hard1111',
  date: new Date(),
  important: true,
})

note.save().then(() => {
  console.log('note saved!')
  mongoose.connection.close()
})
/*

Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})*/