import db from '../config/database.js';
import path from 'path';
// Create a new flock
export const createFlock = (req, res) => {
  console.log('Received form data:', req.body);
  console.log('Received file:', req.file);

  const {
    assigned_to,
    Location,
    caretaker_farmer,
    flock_id,
    nepali_date,
    english_date,
    quantity,
    address,
    corporative_name,
  } = req.body;

  const image_location = req.file ? req.file.path : null;

  // Convert quantity to number
  const quantityNum = parseInt(quantity, 10);

  const query = `INSERT INTO flocks (assigned_to, Location, caretaker_farmer, flock_id, nepali_date, english_date, quantity, image_location, address, corporative_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      assigned_to,
      Location,
      caretaker_farmer,
      flock_id,
      nepali_date,
      english_date,
      quantityNum,
      image_location,
      address,
      corporative_name,
    ],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).send({ message: err.message });
      } else {
        res.status(201).send({
          message: 'Flock created successfully',
          flockId: result.insertId,
          image_location: image_location,
        });
      }
    }
  );
};
// Get all flocks
export const getFlock = (req, res) => {
  const userRole = req.userRole;
  let query;
  let queryParams = [];

  if (userRole === 0 || userRole === 1) {
    // For roles 0 and 1, show all flocks
    query = 'SELECT * FROM flocks';
  } else if (userRole === 2) {
    // For role 2, show only assigned flocks
    query = 'SELECT * FROM flocks WHERE assigned_to = ?';
    queryParams.push(req.user.id); // Assuming req.user.id contains the user's ID
  } else {
    // For any other role, deny access
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else {
      res.status(200).send(results);
    }
  });
};

export const getFlockById = (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM flocks WHERE id=?';

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ message: 'Flock details not found' });
    } else {
      res.status(200).send(results);
    }
  });
};
