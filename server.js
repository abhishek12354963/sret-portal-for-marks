const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MARKS_FILE = path.join(__dirname, 'data', 'marks.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Read-only: get marks for a student by ID (no edit/update endpoints)
function getMarksData() {
  try {
    const raw = fs.readFileSync(MARKS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { students: [] };
  }
}

function saveMarksData(data) {
  try {
    fs.writeFileSync(MARKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving marks:', e);
    return false;
  }
}

// API: get marks by student ID (read-only) or admin access
app.get('/api/marks', (req, res) => {
  const id = (req.query.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Check for admin access
  if (id === 'admin@123') {
    const data = getMarksData();
    return res.json({
      isAdmin: true,
      students: data.students || []
    });
  }

  // Regular student lookup
  const data = getMarksData();
  const student = data.students.find(s => (s.id || '').toUpperCase() === id.toUpperCase());

  if (!student) {
    return res.status(404).json({ error: 'No marks found for this Student ID' });
  }

  // Return only what's needed for display (read-only, no sensitive fields)
  res.json({
    isAdmin: false,
    id: student.id,
    name: student.name,
    semester: student.semester,
    subjects: student.subjects || []
  });
});

// API: Update marks (admin only)
app.put('/api/marks', (req, res) => {
  const { studentId, subjects } = req.body;
  const adminId = req.query.adminId || '';

  // Verify admin access
  if (adminId !== 'admin@123') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!studentId || !subjects) {
    return res.status(400).json({ error: 'Student ID and subjects are required' });
  }

  const data = getMarksData();
  const studentIndex = data.students.findIndex(s => (s.id || '').toUpperCase() === studentId.toUpperCase());

  if (studentIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Update subjects
  data.students[studentIndex].subjects = subjects;

  if (saveMarksData(data)) {
    res.json({ success: true, message: 'Marks updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save marks' });
  }
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SRET Marks Portal running at http://localhost:${PORT}`);
});
