import { con } from './db.js';
import { randomBytes } from "crypto";

function quizExpressHandler(app) {

    app.post('/api/saveQuiz', (req, res) => {
    const { array, code, author, visibility } = req.body

    // if (!array.question || !array.options || !Array.isArray(array.options) || !array.answer || !code) {
    //   return res.status(400).send('Invalid input');
    // }

    const isPublic = visibility === "public" ? 1 : 0;

    const query1 = 'Select * from quizzes where code = ?'
    con.query(query1, code, (err, results) => {
        if (err) {
        return res.status(500).send('Error checking quiz code')
        }
        if (results.length > 0) {
        return res.status(400).send('Quiz with this code already exists')
        } else {
        const query2 = 'INSERT INTO quizzes (code, author, isPublic, question, options, answer) VALUES (?, ?, ?, ?, ?, ?)'
        let completed = 0
        array.map(q => {
            const params = [code, author, isPublic, q.question, JSON.stringify(q.options), q.answer]
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

    // SELECT CONCAT( '[', GROUP_CONCAT( JSON_OBJECT( 'question', question, 'options', options, 'answer', answer ) ), ']' ) AS quiz FROM quizzes WHERE code = "1";

    app.post('/api/getQuizzes', (req, res) => {
    const { author } = req.body
    
    if (!author) {
        return res.status(400).send('Invalid input')
    }

    const query = 'SELECT * FROM quizzes WHERE author = ? OR isPublic = 1'
    con.query(query, [author], (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving quizzes')
        }
        if (results.length === 0) {
        return res.status(404).send('No quizzes found')
        } else {
        const quizzes = results.map(row => ({
            code: row.code,
            author: row.author,
            visibility: row.isPublic ? 'public' : 'private',
            question: row.question,
            options: JSON.parse(row.options),
            answer: row.answer
        }))
        return res.status(200).json({ success: true, quizzes })
        }
    })
    })

    app.post('/api/isQuizCodeAvailable', (req, res) => {
        const { code } = req.body
        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid input' 
            });
        }
        
        const query = 'SELECT * FROM active WHERE q_url = ?'
        con.query(query, [code], (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error checking quiz code' 
                });
            }

            return res.status(200).json({ 
                success: true,
                available: results.length > 0 
            });
        });
    });

    app.post('/api/startQuiz', (req, res) => {
    const { code } = req.body

    const url = randomBytes(3).toString('hex');
    
    if (!code) {
        return res.status(400).send('Invalid input')
    }

    const query = 'INSERT INTO `active`(`q_code`, `q_url`) VALUES (?, ?)'
    con.query(query, [code, url], (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving quiz')
        }
        if (results.length === 0) {
        return res.status(404).send('Quiz not found')
        } else {
        return res.status(200).json({ success: true, url })
        }
    })
    })

    app.post('/api/endQuiz', (req, res) => {
    const { url } = req.body
    
    if (!url) {
        return res.status(400).send('Invalid input')
    }

    const query = 'DELETE FROM `active` WHERE q_url = ?'
    con.query(query, [url], (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving quiz')
        }
        if (results.length === 0) {
        return res.status(404).send('Quiz not found')
        } else {
        return res.status(200).json({ success: true})
        }
    })
    })

    app.post('/api/getQuiz', (req, res) => {
    const { code } = req.body
    
    if (!code) {
        return res.status(400).send('Invalid input')
    }

    const query = 'SELECT * FROM active WHERE q_url = ?'
    con.query(query, [code], (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving quiz')
        }
        if (results.length === 0) {
        return res.status(404).send('Quiz not found')
        }
        const quizCode = results[0].q_code;
        const query2 = 'SELECT * FROM quizzes WHERE code = ?'
        con.query(query2, [quizCode], (err, results) => {
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
    })
}

export default quizExpressHandler;