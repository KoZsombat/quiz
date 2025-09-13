import cors from 'cors';
import mysql  from 'mysql2';
import bcrypt from 'bcrypt';
import {body, validationResult} from 'express-validator';
import express from 'express';

const app = express(); 

const port = 3000

const saltRounds = 10;

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

async function hashPassword(plainPassword) {
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

async function checkPassword(plainPassword, hashedPassword) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match;
}

app.post('/api/register',   
    [
    body('name')
      .trim()
      .notEmpty().withMessage('A név megadása kötelező.')
      .isLength({ min: 3 }).withMessage('A név legalább 3 karakter legyen.'),
    body('email')
      .isEmail().withMessage('Érvényes email címet adj meg.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('A jelszó legalább 6 karakter legyen.')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({
            response: 0,
            errors: errors.array()
        });
        }

        const { name, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const sql = `SELECT * FROM user WHERE BINARY username = ? OR BINARY email = ?`;
        const params = [name, email]; 
        con.query(sql, params, (err, result) => {
            if (err) {
                console.error("Login lekérdezés hiba:", err);
                return res.status(500).json({ response: -1 });
            }

            if (result.length > 0) {
                return res.json({
                    response: 0,
                });
            } else {
                const sql2 = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`; 
                const params2 = [name, email, hashedPassword];
                con.query(sql2, params2, (err, result) => {
                    if (err) {
                        console.error("Login lekérdezés hiba:", err);
                        return res.status(500).json({ response: -1 });
                    }
                });
                return res.json({
                    response: 1,
                });
            }
        });
    }
);

app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    const sql = `SELECT * FROM user WHERE BINARY username = ?`;
    const params = [name];
    con.query(sql, params, async (err, result) => {
        if (err) {
            console.error("Login lekérdezés hiba:", err);
            return res.status(500).json({ response: 0, message: "Server error" });
        }

        if (result.length === 0) {
            return res.json({ response: 0});
        }

        const user = result[0];

        const isValid = await checkPassword(password, user.password)
        if (isValid) {
            return res.json({ response: 1});
        } else {
            return res.json({ response: 0});
        }
    });
});

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