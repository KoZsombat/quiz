const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const app = express()
const port = 3000

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quiz'
})

con.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err)
  } else {
    console.log('Connected to the database')
  }
})

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

app.post('/api/saveQuiz', (req, res) => {
  const { array, code } = req.body

  if (!question || !options || !Array.isArray(options) || !answer || !code) {
    return res.status(400).send('Invalid input');
  }

  const query1 = 'Select * from quizzes where code = ?'
  con.query(query1, [code], (err, results) => {
    if (err) {
      console.error('Error checking quiz code:', err)
      return res.status(500).send('Error checking quiz code')
    }
    if (results.length > 0) {
      return res.status(400).send('Quiz with this code already exists')
    } else {
      const query2 = 'INSERT INTO quizzes (code, question, options, answer) VALUES (?, ?, ?, ?)'
      const params = array.map(q => [
        code,
        q.question,
        JSON.stringify(q.options),
        q.answer,
      ]);
      con.query(query2, [params], (err, result) => {
        if (err) {
          console.error('Error saving quiz:', err)
          res.status(500).send('Error saving quiz')
        } else {
          console.log('Quiz saved successfully:', result)
          res.status(200).send('Quiz saved successfully')
        }
      })
    }
  })
})

app.listen(port, () => {
  console.log(`Server running`)
})