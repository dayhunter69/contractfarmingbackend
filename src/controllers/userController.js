import db from '../config/database.js';

export const getUsers = (req, res) => {
  const q = 'SELECT id, username, role FROM users';
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
};

// Add other user-related controller functions as needed
