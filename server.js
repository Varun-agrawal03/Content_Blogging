const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const path = require('path');
const methodOverride = require('method-override'); 
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",         
  host: "localhost",
  database: "blogging_site", 
  password: process.env.PASSWORD,       
  port: 5432,
});

db.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.render('index', { blogs: result.rows });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).send('Error fetching blogs');
  }
});



app.post('/blogs', async (req, res) => {
  const { title, content } = req.body;
  try {
    await db.query('INSERT INTO blogs (title, content) VALUES ($1, $2)', [title, content]);
    res.redirect('/');
  } catch (err) {
    console.error('Error adding blog:', err);
    res.status(500).send('Error adding blog');
  }
});

app.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Blog not found');
    }
    const blog = result.rows[0];
    res.render('edit', { blog });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).send('Error fetching blog');
  }
});


app.put('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    await db.query('UPDATE blogs SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [title, content, id]);
    res.redirect('/');
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).send('Error updating blog');
  }
});


app.post('/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await db.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).send('Error deleting blog');
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
