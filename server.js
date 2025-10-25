const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const DATA_FILE = path.join(__dirname, 'tasks.json');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

async function readTasks() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// POST create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title required' });
    const tasks = await readTasks();
    const newTask = {
      id: String(Date.now()) + '-' + Math.floor(Math.random() * 1000),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body; // e.g., { title, completed }
    const tasks = await readTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    tasks[idx] = Object.assign({}, tasks[idx], updates);
    await writeTasks(tasks);
    res.json(tasks[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const tasks = await readTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return res.status(404).json({ error: 'Not found' });
    await writeTasks(filtered);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
