const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3500;
let db;

const mongoURL = 'mongodb+srv://placetrackuser:placetrack2025@placetrack.qxoguxr.mongodb.net'
const dbName = 'placetrack';

MongoClient.connect(mongoURL)
  .then(client => {
    db = client.db(dbName);
    app.listen(port, () => {
      console.log(`✅ Server is listening on port ${port} and connected to MongoDB`);
    });
  })
  .catch(err => console.log(err));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Auth Middleware
const SECRET_KEY = 'placetrack2025'
function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing API key.' })
  }
  next()
}
app.use('/api', authMiddleware)

// GET all records
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await db.collection('tasks').find({}).sort({ title: 1 }).toArray();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tasks');
  }
});

// POST add new record
app.post('/api/add', async (req, res) => {
  try {
    const newTask = {
      studentName: req.body.studentName,
      company: req.body.company,
      role: req.body.role,
      ctc: Number(req.body.ctc),
      type: req.body.type,
      status: req.body.status || 'Pending'
    };
    const result = await db.collection('tasks').insertOne(newTask);
    console.log('Task added:', result.insertedId);
    res.status(201).json({ ...newTask, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding task');
  }
});

// GET toggle status by id
app.get('/api/update/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!ObjectId.isValid(taskId)) {
      return res.status(400).send('Invalid task ID format');
    }
    const objectId = new ObjectId(taskId);
    const task = await db.collection('tasks').findOne({ _id: objectId });
    if (!task) return res.status(404).send('No matching id found');

    const cycle = { 'Pending': 'Approved', 'Approved': 'Rejected', 'Rejected': 'Pending' };
    const newStatus = cycle[task.status] || 'Pending';

    const updateResult = await db.collection('tasks').updateOne(
      { _id: objectId },
      { $set: { status: newStatus } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).send('No matching id found');
    }

    console.log('Task status updated for ID:', taskId);
    res.send('success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating task');
  }
});

// DELETE record by id
app.delete('/api/delete/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!ObjectId.isValid(taskId)) {
      return res.status(400).send('Invalid task ID format');
    }
    const objectId = new ObjectId(taskId);
    const deleteResult = await db.collection('tasks').deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).send('No matching id found');
    }

    console.log('Task deleted for ID:', taskId);
    res.send('success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting task');
  }
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});