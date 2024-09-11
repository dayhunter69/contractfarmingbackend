import db from '../config/database.js';

export const getAllBooks = (req, res) => {
  // This route is now protected, only accessible to admin and superadmin
  const q = 'SELECT * FROM books';
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
};

export const createBook = (req, res) => {
  const q = 'INSERT INTO books (`title`, `desc`, `cover`, `price`) VALUES(?)';
  const values = [
    req.body.title,
    req.body.desc,
    req.body.cover,
    req.body.price,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json('Book has been created successfully!');
  });
};
