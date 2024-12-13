import db from '../config/database.js';
import path from 'path';
import fs from 'fs';
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

  const query = `INSERT INTO flocks (assigned_to, Location, caretaker_farmer, flock_id, nepali_date, english_date, quantity, image_location, address, corporative_name )
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
    query = `
      SELECT 
        f.*,
        u.username as username_assigned_to,
        (SELECT MAX(age_days) FROM flock_detail WHERE flock_id = f.id) as highest_age,
        (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) FROM flock_detail WHERE flock_id = f.id) as total_feed_consumption,
        (SELECT SUM(mortality_birds) FROM flock_detail WHERE flock_id = f.id) as total_mortality,
        (SELECT SUM(number_of_birds_sold) FROM flock_detail WHERE flock_id = f.id) as total_sales,
        (
          SELECT JSON_OBJECT(
            'avg_weight', fd.avg_weight,
            'weight_age', fd.age_days,
            'fcr', (CASE WHEN fd.total_weight > 0 THEN (fd.total_feed_consumption / fd.total_weight) ELSE 0 END)
          )
          FROM (
            SELECT 
              fd.*, 
              (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
               FROM flock_detail 
               WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
              fd.num_birds * fd.avg_weight / 1000 AS total_weight
            FROM flock_detail fd
            WHERE fd.flock_id = f.id AND fd.avg_weight > 0
            ORDER BY fd.age_days DESC
            LIMIT 1
          ) fd
        ) as latest_flock_detail
      FROM flocks f
      LEFT JOIN users u ON f.assigned_to = u.id
    `;
  } else if (userRole === 2) {
    query = `
      SELECT
        f.*,
        u.username as username_assigned_to,
        (SELECT MAX(age_days) FROM flock_detail WHERE flock_id = f.id) as highest_age,
        (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) FROM flock_detail WHERE flock_id = f.id) as total_feed_consumption,
        (SELECT SUM(mortality_birds) FROM flock_detail WHERE flock_id = f.id) as total_mortality,
        (SELECT SUM(number_of_birds_sold) FROM flock_detail WHERE flock_id = f.id) as total_sales,
        (
          SELECT JSON_OBJECT(
            'avg_weight', fd.avg_weight,
            'weight_age', fd.age_days,
            'fcr', (CASE WHEN fd.total_weight > 0 THEN (fd.total_feed_consumption / fd.total_weight) ELSE 0 END)
          )
          FROM (
            SELECT
              fd.*, 
              (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
               FROM flock_detail 
               WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
              fd.num_birds * fd.avg_weight / 1000 AS total_weight
            FROM flock_detail fd
            WHERE fd.flock_id = f.id AND fd.avg_weight > 0
            ORDER BY fd.age_days DESC
            LIMIT 1
          ) fd
        ) as latest_flock_detail
      FROM flocks f
      LEFT JOIN users u ON f.assigned_to = u.id
      WHERE f.assigned_to = ?
    `;
    queryParams.push(req.user.id);
  } else {
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
  const userRole = req.userRole;
  let query;
  let queryParams = [];

  if (userRole === 0 || userRole === 1) {
    query = `
      SELECT 
        f.*,
        u.username as username_assigned_to,
        (SELECT MAX(age_days) FROM flock_detail WHERE flock_id = f.id) as highest_age,
        (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) FROM flock_detail WHERE flock_id = f.id) as total_feed,
        (SELECT SUM(mortality_birds) FROM flock_detail WHERE flock_id = f.id) as total_mortality,
        (SELECT SUM(number_of_birds_sold) FROM flock_detail WHERE flock_id = f.id) as total_sales,
        (
          SELECT JSON_OBJECT(
            'avg_weight', fd.avg_weight,
            'weight_age', fd.age_days,
            'fcr', (CASE WHEN fd.total_weight > 0 THEN (fd.total_feed_consumption / fd.total_weight) ELSE 0 END)
          )
          FROM (
            SELECT 
              fd.*, 
              (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
               FROM flock_detail 
               WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
              fd.num_birds * fd.avg_weight / 1000 AS total_weight
            FROM flock_detail fd
            WHERE fd.flock_id = f.id AND fd.avg_weight > 0
            ORDER BY fd.age_days DESC
            LIMIT 1
          ) fd
        ) as latest_flock_detail
      FROM flocks f
      LEFT JOIN users u ON f.assigned_to = u.id
      WHERE f.id = ?
    `;
    queryParams.push(id);
  } else if (userRole === 2) {
    query = `
      SELECT 
        f.*,
        u.username as username_assigned_to,
        (SELECT MAX(age_days) FROM flock_detail WHERE flock_id = f.id) as highest_age,
        (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) FROM flock_detail WHERE flock_id = f.id) as total_feed,
        (SELECT SUM(mortality_birds) FROM flock_detail WHERE flock_id = f.id) as total_mortality,
        (SELECT SUM(number_of_birds_sold) FROM flock_detail WHERE flock_id = f.id) as total_sales,
        (
          SELECT JSON_OBJECT(
            'avg_weight', fd.avg_weight,
            'weight_age', fd.age_days,
            'fcr', (CASE WHEN fd.total_weight > 0 THEN (fd.total_feed_consumption / fd.total_weight) ELSE 0 END)
          )
          FROM (
            SELECT 
              fd.*, 
              (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
               FROM flock_detail 
               WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
              fd.num_birds * fd.avg_weight / 1000 AS total_weight
            FROM flock_detail fd
            WHERE fd.flock_id = f.id AND fd.avg_weight > 0
            ORDER BY fd.age_days DESC
            LIMIT 1
          ) fd
        ) as latest_flock_detail
      FROM flocks f
      LEFT JOIN users u ON f.assigned_to = u.id
      WHERE f.id = ? AND f.assigned_to = ?
    `;
    queryParams.push(id, req.user.id);
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).send({ message: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ message: 'Flock details not found' });
    } else {
      // Since this is a single flock, we can return the first (and only) element of the results array
      const flock = results[0];
      res.status(200).send(flock);
    }
  });
};

export const updateFlockCum = (req, res) => {
  console.log('Received update data:', req.body);

  const { id, cum_mortality, cum_sold } = req.body;

  // Validate required fields
  if (!id) {
    return res.status(400).send({ message: 'ID is required' });
  }

  // Convert values to numbers if they're strings
  const mortality = parseInt(cum_mortality, 10) || 0;
  const sold = parseInt(cum_sold, 10) || 0;

  const query = `
    UPDATE flocks 
    SET cum_mortality = ?, cum_sold = ?
    WHERE id = ?
  `;

  db.query(query, [mortality, sold, id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'Flock not found or no changes made',
      });
    }

    res.status(200).send({
      message: 'Flock statistics updated successfully',
      id: id,
      updated: {
        cum_mortality: mortality,
        cum_sold: sold,
      },
    });
  });
};

// update and delete:
// Add this to your existing controller file (flockController.js)

export const updateFlock = (req, res) => {
  const id = req.params.id;

  // Start with an empty array for SET clauses and query parameters
  const updates = [];
  const queryParams = [];

  // Check each possible field in the request body
  const fields = [
    'assigned_to',
    'Location',
    'caretaker_farmer',
    'flock_id',
    'nepali_date',
    'english_date',
    'quantity',
    'address',
    'corporative_name',
    'complete_date',
  ];

  // Only add fields that are present in the request
  fields.forEach((field) => {
    if (field in req.body) {
      updates.push(`${field} = ?`);
      queryParams.push(req.body[field]);
    }
  });

  // Handle image upload if present
  if (req.file) {
    // Get old image before updating
    const queryOldImage = 'SELECT image_location FROM flocks WHERE id = ?';
    db.query(queryOldImage, [id], (err, results) => {
      if (!err && results[0]?.image_location) {
        fs.unlink(results[0].image_location, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
    });

    updates.push('image_location = ?');
    queryParams.push(req.file.path);
  }

  // If no updates were requested, return early
  if (updates.length === 0) {
    return res.status(400).send({
      message: 'No valid fields provided for update',
    });
  }

  // Construct the query
  const query = `
    UPDATE flocks 
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  // Add the id to query parameters
  queryParams.push(id);

  // Execute the update query
  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send({ message: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ message: 'Flock not found' });
    } else {
      // Fetch the updated record to return in response
      db.query('SELECT * FROM flocks WHERE id = ?', [id], (err, rows) => {
        if (err) {
          res.status(200).send({
            message: 'Flock updated successfully',
            updated: { id, ...req.body },
          });
        } else {
          res.status(200).send({
            message: 'Flock updated successfully',
            updated: rows[0],
          });
        }
      });
    }
  });
};

export const deleteFlock = (req, res) => {
  const id = req.params.id;

  // Start a transaction to ensure data consistency
  db.beginTransaction(async (err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: 'Transaction error: ' + err.message });
    }

    try {
      // First, get all flock_detail records to delete their images
      const getFlockDetailsQuery =
        'SELECT image_mortality, feed_image, field_image FROM flock_detail WHERE flock_id = ?';
      db.query(getFlockDetailsQuery, [id], (err, detailResults) => {
        if (err) throw err;

        // Delete all image files from flock_detail records
        detailResults.forEach((detail) => {
          if (detail.image_mortality) {
            fs.unlink(detail.image_mortality, (err) => {
              if (err) console.error('Error deleting mortality image:', err);
            });
          }
          if (detail.feed_image) {
            fs.unlink(detail.feed_image, (err) => {
              if (err) console.error('Error deleting feed image:', err);
            });
          }
          if (detail.field_image) {
            fs.unlink(detail.field_image, (err) => {
              if (err) console.error('Error deleting field image:', err);
            });
          }
        });

        // Delete all flock_detail records for this flock
        const deleteDetailsQuery =
          'DELETE FROM flock_detail WHERE flock_id = ?';
        db.query(deleteDetailsQuery, [id], (err, detailDeleteResult) => {
          if (err) throw err;

          // Get the flock image location before deleting the flock
          const getFlockQuery =
            'SELECT image_location FROM flocks WHERE id = ?';
          db.query(getFlockQuery, [id], (err, flockResults) => {
            if (err) throw err;

            // Delete the flock's image if it exists
            if (flockResults[0]?.image_location) {
              fs.unlink(flockResults[0].image_location, (err) => {
                if (err) console.error('Error deleting flock image:', err);
              });
            }

            // Finally, delete the flock record
            const deleteFlockQuery = 'DELETE FROM flocks WHERE id = ?';
            db.query(deleteFlockQuery, [id], (err, flockDeleteResult) => {
              if (err) throw err;

              if (flockDeleteResult.affectedRows === 0) {
                db.rollback(() => {
                  res.status(404).send({ message: 'Flock not found' });
                });
                return;
              }

              // Commit the transaction if everything succeeded
              db.commit((err) => {
                if (err) {
                  db.rollback(() => {
                    res
                      .status(500)
                      .send({ message: 'Commit error: ' + err.message });
                  });
                  return;
                }

                res.status(200).send({
                  message: 'Flock and associated details deleted successfully',
                  deletedDetailsCount: detailDeleteResult.affectedRows,
                  deletedFlockCount: flockDeleteResult.affectedRows,
                });
              });
            });
          });
        });
      });
    } catch (error) {
      db.rollback(() => {
        res.status(500).send({ message: 'Error: ' + error.message });
      });
    }
  });
};
