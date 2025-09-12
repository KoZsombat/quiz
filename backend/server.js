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

  // if (!array.question || !array.options || !Array.isArray(array.options) || !array.answer || !code) {
  //   return res.status(400).send('Invalid input');
  // }

  const query1 = 'Select * from quizzes where code = ?'
  con.query(query1, code, (err, results) => {
    if (err) {
      return res.status(500).send('Error checking quiz code')
    }
    if (results.length > 0) {
      return res.status(400).send('Quiz with this code already exists')
    } else {
      const query2 = 'INSERT INTO quizzes (code, question, options, answer) VALUES (?, ?, ?, ?)'
      let completed = 0
      array.map(q => {
        const params = [code, q.question, JSON.stringify(q.options), q.answer]
        con.query(query2, params, (err, result) => {
          if (err) {
            res.status(500).send('Error saving quiz')
          } else {
            completed++
            if (completed === array.length && !res.headersSent) {
              res.status(200).send('Quiz saved successfully')
            }
          }
        })
      })
    }
  })
})

app.post('/api/getQuiz', (req, res) => {
  const { code } = req.body
  
  if (!code) {
    return res.status(400).send('Invalid input')
  }
  const query = 'SELECT * FROM quizzes WHERE code = ?'
  con.query(query, [code], (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving quiz')
    }
    if (results.length === 0) {
      return res.status(404).send('Quiz not found')
    } else {
      const quiz = results.map(row => ({
        question: row.question,
        options: JSON.parse(row.options),
        answer: row.answer
      }))
      return res.status(200).json(quiz)
    }
  })
})

app.listen(port, () => {
  console.log(`Server running`)
})