import mysql from 'mysql2';

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

export { con };