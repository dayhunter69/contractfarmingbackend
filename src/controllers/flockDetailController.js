// flockDetailController.js
import db from '../config/database.js';

export const createFlockDetail = (req, res) => {
  console.log('Received form data:', req.body);
  console.log('Received files:', req.files);

  const {
    nepali_date,
    english_date,
    location,
    age_days,
    num_birds,
    mortality_birds,
    number_of_birds_sold, // Add default values for these fields
    net_weight_sold,
    price_per_kg,
    bps_stock,
    b1_stock,
    b2_stock,
    bps_consumption,
    b1_consumption,
    b2_consumption,
    mortality_reason,
    medicine,
    flock_id,
  } = req.body;

  // Get image paths, handling both file uploads and direct path strings
  const image_mortality =
    req.files?.['image_mortality']?.[0]?.path ||
    req.body.image_mortality ||
    null;
  const feed_image =
    req.files?.['feed_image']?.[0]?.path || req.body.feed_image || null;
  const field_image =
    req.files?.['field_image']?.[0]?.path || req.body.field_image || null;

  const query = `INSERT INTO flock_detail 
                 (nepali_date, english_date, location, age_days, num_birds, mortality_birds, number_of_birds_sold, net_weight_sold, price_per_kg, 
                  bps_stock, b1_stock, b2_stock, bps_consumption, b1_consumption, b2_consumption, 
                  mortality_reason, medicine, image_mortality, flock_id, feed_image, field_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      nepali_date,
      english_date,
      location,
      age_days,
      num_birds,
      mortality_birds,
      number_of_birds_sold, // Add this
      net_weight_sold, // Add this
      price_per_kg, // Add this
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
      feed_image,
      field_image,
    ],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
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
