import bcrypt from 'bcrypt';
import db from '../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/tokenUtils.js';

export const login = (req, res) => {
  const { username, password } = req.body;

  const q = 'SELECT * FROM users WHERE username = ?';
  db.query(q, [username], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(401).json('Invalid credentials');

    const user = data[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.status(401).json('Invalid credentials');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: Number(user.role) },
    });
  });
};

export const signup = (req, res) => {
  const { username, password, role } = req.body;
  const createdBy = req.user.id; // Get the ID of the logged-in user

  // Check if the user making the request is an admin or superadmin
  if (req.user.role !== 0 && req.user.role !== 1) {
    return res.status(403).json('Unauthorized to create new accounts');
  }

  const q =
    'INSERT INTO users (username, password, role, created_by) VALUES (?, ?, ?, ?)';
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json(err);

    db.query(q, [username, hash, role, createdBy], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json(err);
      }
      res.status(201).json('User created successfully');
    });
  });
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  // Verify refresh token and generate new access token
  // Implementation depends on your token storage strategy
};

export const logout = (req, res) => {
  // Implement logout logic
  // This might involve invalidating the refresh token
  res.json('Logged out successfully');
};
