// flockDetailController.js
import db from '../config/database.js';
import fs from 'fs';
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
    number_of_birds_sold,
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
    avg_weight,
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

  // Fetch the latest flock detail entry
  const queryGetLatestFlockDetail =
    'SELECT * FROM flock_detail WHERE flock_id = ? ORDER BY age_days DESC LIMIT 1';
  db.query(queryGetLatestFlockDetail, [flock_id], (err, latestFlockDetail) => {
    if (err) {
      console.error('Error fetching latest flock detail:', err);
      return res.status(500).send({ message: err.message });
    }

    let totalConsumption = 0;
    let totalWeight = 0;

    if (latestFlockDetail.length > 0) {
      // Calculate total consumption, weight, and birds based on latest flock detail
      totalConsumption =
        latestFlockDetail[0].bps_consumption +
        latestFlockDetail[0].b1_consumption +
        latestFlockDetail[0].b2_consumption;
    }

    // Add the current day's consumption, weight, and birds to the totals
    totalConsumption += bps_consumption + b1_consumption + b2_consumption;
    totalWeight =
      ((num_birds - mortality_birds - number_of_birds_sold) * avg_weight) /
      1000;

    // Calculate the new FCR
    let newFcr = 0;
    if (avg_weight > 0) {
      newFcr = totalConsumption / totalWeight;
    } else {
      newFcr = 0;
    }

    const query = `INSERT INTO flock_detail 
                  (nepali_date, english_date, location, age_days, num_birds, mortality_birds, number_of_birds_sold, 
                   net_weight_sold, price_per_kg, bps_stock, b1_stock, b2_stock, bps_consumption, b1_consumption, 
                   b2_consumption, mortality_reason, medicine, image_mortality, flock_id, feed_image, field_image, 
                   avg_weight, fcr)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [
        nepali_date,
        english_date,
        location,
        age_days,
        num_birds,
        mortality_birds,
        number_of_birds_sold,
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
        image_mortality,
        flock_id,
        feed_image,
        field_image,
        avg_weight,
        newFcr,
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
  });
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

// This function send all the flock detail which matches with the flock_id not flockDetail_id
// export const getFlockDetailById = (req, res) => {
//   const flock_id = req.params.id;

//   const query = 'SELECT * FROM flock_detail WHERE flock_id = ?';

//   db.query(query, [flock_id], (err, results) => {
//     if (err) {
//       res.status(500).send({ message: err.message });
//     } else if (results.length === 0) {
//       res.status(404).send({ message: 'Flock details not found' });
//     } else {
//       res.status(200).send(results);
//     }
//   });
// };

// This function send all the flock detail which matches with the flock_id not flockDetail_id
export const getFlockDetailById = (req, res) => {
  const flock_id = req.params.id;

  const query = `
    SELECT fd.*, 
    (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
     FROM flock_detail 
     WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
    fd.num_birds * fd.avg_weight / 1000 AS total_weight
    FROM flock_detail fd
    WHERE fd.flock_id = ?
    ORDER BY fd.age_days
  `;

  db.query(query, [flock_id], (err, results) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Flock details not found' });
    }

    // Calculate generated FCR for each row
    const resultsWithGeneratedFCR = results.map((row) => ({
      ...row,
      generated_fcr:
        row.total_feed_consumption > 0 && row.total_weight > 0
          ? (row.total_feed_consumption / row.total_weight).toFixed(6)
          : 0,
    }));

    res.status(200).send(resultsWithGeneratedFCR);
  });
};

export const getsingleFlockDetailById = (req, res) => {
  const flock_id = req.params.id;

  const query = 'SELECT * FROM flock_detail WHERE id = ?';

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

export const updateFlockDetail = (req, res) => {
  const id = req.params.id;

  // Start with empty arrays for SET clauses and query parameters
  const updates = [];
  const queryParams = [];

  // List of all possible fields
  const fields = [
    'nepali_date',
    'english_date',
    'location',
    'age_days',
    'num_birds',
    'mortality_birds',
    'number_of_birds_sold',
    'net_weight_sold',
    'price_per_kg',
    'bps_stock',
    'b1_stock',
    'b2_stock',
    'bps_consumption',
    'b1_consumption',
    'b2_consumption',
    'mortality_reason',
    'medicine',
    'flock_id',
    'avg_weight',
  ];

  // Add fields that are present in the request
  fields.forEach((field) => {
    if (field in req.body) {
      updates.push(`${field} = ?`);
      queryParams.push(req.body[field]);
    }
  });

  // Handle image updates
  const imageFields = [
    { name: 'image_mortality', file: req.files?.['image_mortality']?.[0] },
    { name: 'feed_image', file: req.files?.['feed_image']?.[0] },
    { name: 'field_image', file: req.files?.['field_image']?.[0] },
  ];

  // Get old images before updating
  const queryOldImages =
    'SELECT image_mortality, feed_image, field_image FROM flock_detail WHERE id = ?';
  db.query(queryOldImages, [id], (err, results) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Flock detail not found' });
    }

    const oldImages = results[0];

    // Handle each image field
    imageFields.forEach(({ name, file }) => {
      if (file) {
        // Delete old image if it exists
        if (oldImages[name]) {
          fs.unlink(oldImages[name], (err) => {
            if (err) console.error(`Error deleting old ${name}:`, err);
          });
        }
        updates.push(`${name} = ?`);
        queryParams.push(file.path);
      }
    });

    // If no updates were requested, return early
    if (updates.length === 0) {
      return res.status(400).send({
        message: 'No valid fields provided for update',
      });
    }

    // Fetch the latest flock detail entry
    const queryGetLatestFlockDetail =
      'SELECT * FROM flock_detail WHERE flock_id = ? ORDER BY age_days DESC LIMIT 1';
    db.query(
      queryGetLatestFlockDetail,
      [req.params.id],
      (err, latestFlockDetail) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }

        let totalConsumption = 0;
        let totalWeight = 0;

        if (latestFlockDetail.length > 0) {
          // Calculate total consumption and weight based on latest flock detail
          totalConsumption =
            latestFlockDetail[0].bps_consumption +
            latestFlockDetail[0].b1_consumption +
            latestFlockDetail[0].b2_consumption;
        }
        // Calculate the current day's total weight:
        // Parse numeric inputs into integers or floats as needed
        const numBirds = parseInt(req.body.num_birds, 10);
        const mortalityBirds = parseInt(req.body.mortality_birds, 10);
        const numberOfBirdsSold = parseInt(req.body.number_of_birds_sold, 10);
        const avgWeight = parseFloat(req.body.avg_weight);

        const bpsConsumption = parseFloat(req.body.bps_consumption);
        const b1Consumption = parseFloat(req.body.b1_consumption);
        const b2Consumption = parseFloat(req.body.b2_consumption);

        // Calculate total weight
        totalWeight =
          ((numBirds - mortalityBirds - numberOfBirdsSold) * avgWeight) / 1000;
        console.log(totalWeight);

        // Add the current day's consumption to the totals
        totalConsumption += bpsConsumption + b1Consumption + b2Consumption;
        // Calculate the new FCR
        console.log('total consumption: ' + totalConsumption);
        let newFcr = 0;
        if (req.body.avg_weight > 0) {
          newFcr = totalConsumption / totalWeight;
        } else {
          newFcr = 0;
        }

        // Construct the update query
        const query = `
        UPDATE flock_detail 
        SET ${updates.join(', ')}, fcr = ?
        WHERE id = ?
      `;

        // Add the id and new FCR to query parameters
        queryParams.push(newFcr, id);

        // Execute the update query
        db.query(query, queryParams, (err, result) => {
          if (err) {
            console.error('Database error:', err);
            res.status(500).send({ message: err.message });
          } else if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Flock detail not found' });
          } else {
            // Fetch the updated record to return in response
            db.query(
              'SELECT * FROM flock_detail WHERE id = ?',
              [id],
              (err, rows) => {
                if (err) {
                  res.status(200).send({
                    message: 'Flock detail updated successfully',
                    updated: { id, ...req.body },
                  });
                } else {
                  res.status(200).send({
                    message: 'Flock detail updated successfully',
                    updated: rows[0],
                  });
                }
              }
            );
          }
        });
      }
    );
  });
};

export const deleteFlockDetail = (req, res) => {
  const id = req.params.id;

  // First get the image locations
  const queryImages =
    'SELECT image_mortality, feed_image, field_image FROM flock_detail WHERE id = ?';
  db.query(queryImages, [id], (err, results) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Flock detail not found' });
    }

    const images = results[0];

    // Delete all associated images
    const imagePaths = [
      images.image_mortality,
      images.feed_image,
      images.field_image,
    ];

    imagePaths.forEach((path) => {
      if (path) {
        fs.unlink(path, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      }
    });

    // Delete the record from database
    const deleteQuery = 'DELETE FROM flock_detail WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).send({ message: 'Flock detail not found' });
      } else {
        res.status(200).send({
          message: 'Flock detail deleted successfully',
          deleted: {
            id,
            deletedImages: imagePaths.filter(Boolean).length,
          },
        });
      }
    });
  });
};

// get dashboard data of particular flock

export const getAnalysis = (req, res) => {
  const flock_id = req.params.id;

  const query = `
    WITH FeedConsumption AS (
      SELECT 
        fd.*,
        (SELECT SUM(bps_consumption + b1_consumption + b2_consumption) 
         FROM flock_detail 
         WHERE flock_id = fd.flock_id AND age_days <= fd.age_days) AS total_feed_consumption,
        fd.num_birds * fd.avg_weight / 1000 AS total_weight
      FROM flock_detail fd
      WHERE fd.flock_id = ?
    ),
    MortalityInfo AS (
      SELECT 
        (SELECT num_birds FROM flock_detail WHERE flock_id = ? ORDER BY age_days ASC LIMIT 1) AS total_birds,
        (SELECT SUM(mortality_birds) FROM flock_detail WHERE flock_id = ?) AS total_deceased
    )
    SELECT 
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'age_days', age_days,
            'generated_fcr', 
              CASE 
                WHEN total_feed_consumption > 0 AND total_weight > 0 
                THEN ROUND(total_feed_consumption / total_weight, 6)
                ELSE 0 
              END,
            'avg_weight', avg_weight,
            'total_feed_consumption', ROUND(total_feed_consumption, 2)
          )
        )
        FROM (
          SELECT * FROM FeedConsumption
          WHERE age_days % 7 = 0
          ORDER BY age_days
          LIMIT 8
        ) AS DailyData
      ) AS analysis,
      (
        SELECT JSON_OBJECT(
          'total_birds', total_birds,
          'total_deceased', total_deceased
        )
        FROM MortalityInfo
      ) AS mortality
  `;

  db.query(query, [flock_id, flock_id, flock_id], (err, results) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Flock details not found' });
    }

    // Parse the JSON results
    const finalResult = {
      analysis: JSON.parse(results[0].analysis),
      mortality: JSON.parse(results[0].mortality),
    };

    res.status(200).send(finalResult);
  });
};
