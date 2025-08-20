import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '15mansha_8878',
  database: 'elearning'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// ===== Multer setup for PDF uploads =====
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== API Routes =====

// Upload PDF
app.post('/upload', upload.single('file'), (req, res) => {
  const { title, subject, description } = req.body;
  const file_path = req.file.filename;
  db.query(
    'INSERT INTO pdfs (title, subject, description, file_path, views, downloads) VALUES (?, ?, ?, ?, 0, 0)',
    [title, subject, description, file_path],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'PDF uploaded', pdf: { title, subject, description, file_path } });
    }
  );
});

// Get all PDFs
app.get('/pdfs', (req, res) => {
  db.query('SELECT * FROM pdfs', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Create User
app.post('/user', (req, res) => {
  const { firstName, lastName, age, gender, grade, school, state, address, email, username, password } = req.body;
  db.query(
    'INSERT INTO users (firstName, lastName, age, gender, grade, school, state, address, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [firstName, lastName, age, gender, grade, school, state, address, email, username, password],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User created', userId: result.insertId });
    }
  );
});

// Get user by username
app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
