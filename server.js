const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3500;

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

// In-memory data store
let records = [
  { id: 1, studentName: 'Aisha Patel', company: 'Google', role: 'SWE Intern', ctc: 80000, type: 'Internship', status: 'Approved' },
  { id: 2, studentName: 'Rohan Mehta', company: 'Infosys', role: 'Associate Engineer', ctc: 420000, type: 'Placement', status: 'Pending' },
  { id: 3, studentName: 'Divya Nair', company: 'Microsoft', role: 'PM Intern', ctc: 90000, type: 'Internship', status: 'Pending' },
  { id: 4, studentName: 'Karthik Raj', company: 'TCS', role: 'System Engineer', ctc: 380000, type: 'Placement', status: 'Approved' },
  { id: 5, studentName: 'Priya Singh', company: 'Amazon', role: 'SDE-1', ctc: 1200000, type: 'Placement', status: 'Rejected' },
];
let nextId = 6;

// GET all records
app.get('/api/tasks', (req, res) => {
  res.json(records);
});

// POST add new record
app.post('/api/add', (req, res) => {
  const { studentName, company, role, ctc, type } = req.body;
  if (!studentName || !company || !role || !ctc || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newRecord = {
    id: nextId++,
    studentName,
    company,
    role,
    ctc: Number(ctc),
    type,
    status: 'Pending'
  };
  records.push(newRecord);
  res.status(201).json(newRecord);
});

// GET toggle status by id
app.get('/api/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const record = records.find(r => r.id === id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  const cycle = { 'Pending': 'Approved', 'Approved': 'Rejected', 'Rejected': 'Pending' };
  record.status = cycle[record.status] || 'Pending';
  res.json(record);
});

// DELETE record by id
app.delete('/api/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  records.splice(idx, 1);
  res.json({ success: true });
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});