import db from '../config/database.js';

export const getUsers = (req, res) => {
  const q = 'SELECT id, username, role FROM users';
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
};
export const getUserById = (req, res) => {
  const userId = req.params.id;
  const q = 'SELECT id, username, role FROM users WHERE id = ?';

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json({ message: 'User not found' });

    return res.json(data[0]);
  });
};

// Add other user-related controller functions as needed
