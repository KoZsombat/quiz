import bcrypt from 'bcrypt';
import {body, validationResult} from 'express-validator';
import { con } from './db.js';

function loginHandler(app) {

    async function hashPassword(plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    return hashed;
    }

    async function checkPassword(plainPassword, hashedPassword) {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
    }

    const saltRounds = 10;

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
}

export default loginHandler;