import db from '../config/database.js';

// Create a new flock detail
export const createFlockDetail = (req, res) => {
  const {
    nepali_date,
    english_date,
    location,
    age_days,
    num_birds,
    mortality_birds,
    bps_stock,
    b1_stock,
    b2_stock,
    bps_consumption,
    b1_consumption,
    b2_consumption,
    mortality_reason,
    medicine,
    image_mortality,
    flock_id,
  } = req.body;

  const query = `INSERT INTO flock_detail 
                 (nepali_date, english_date, location, age_days, num_birds, mortality_birds, 
                  bps_stock, b1_stock, b2_stock, bps_consumption, b1_consumption, b2_consumption, 
                  mortality_reason, medicine, image_mortality, flock_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      nepali_date,
      english_date,
      location,
      age_days,
      num_birds,
      mortality_birds,
      bps_stock,
      b1_stock,
      b2_stock,
      bps_consumption,
      b1_consumption,
      b2_consumption,
      mortality_reason,
      medicine,
      image_mortality,
      flock_id,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        res.status(201).send({
          message: 'Flock detail created successfully',
          flockDetailId: result.insertId,
        });
      }
    }
  );
};

// Get all flock details
export const getFlockDetails = (req, res) => {
  const query = 'SELECT * FROM flock_detail';

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else {
      res.status(200).send(results);
    }
  });
};

// Get a specific flock detail by flock_id
export const getFlockDetailById = (req, res) => {
  const flock_id = req.params.id;

  const query = 'SELECT * FROM flock_detail WHERE flock_id = ?';

  db.query(query, [flock_id], (err, results) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ message: 'Flock details not found' });
    } else {
      res.status(200).send(results);
    }
  });
};
