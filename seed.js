const { MongoClient } = require('mongodb');

const mongoURL = 'mongodb+srv://placetrackuser:placetrack2025@placetrack.qxoguxr.mongodb.net/placetrack?retryWrites=true&w=majority&ssl=true&authSource=admin&appName=placetrack'
const dbName = 'placetrack';

const records = [
  { studentName: 'Aisha Patel', company: 'Google', role: 'SWE Intern', ctc: 80000, type: 'Internship', status: 'Approved' },
  { studentName: 'Rohan Mehta', company: 'Infosys', role: 'Associate Engineer', ctc: 420000, type: 'Placement', status: 'Pending' },
  { studentName: 'Divya Nair', company: 'Microsoft', role: 'PM Intern', ctc: 90000, type: 'Internship', status: 'Pending' },
  { studentName: 'Karthik Raj', company: 'TCS', role: 'System Engineer', ctc: 380000, type: 'Placement', status: 'Approved' },
  { studentName: 'Priya Singh', company: 'Amazon', role: 'SDE-1', ctc: 1200000, type: 'Placement', status: 'Rejected' },
];

MongoClient.connect(mongoURL)
  .then(async client => {
    const db = client.db(dbName);
    await db.collection('tasks').deleteMany({});
    await db.collection('tasks').insertMany(records);
    console.log('✅ Database seeded successfully!');
    client.close();
  })
  .catch(err => console.log(err));