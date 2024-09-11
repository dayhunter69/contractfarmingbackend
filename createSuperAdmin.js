import mysql from 'mysql';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  }
  console.log('Connected to the database.');

  // Check if superadmin already exists
  db.query(
    'SELECT * FROM users WHERE role = ?',
    ['superadmin'],
    (err, results) => {
      if (err) {
        console.error('Error checking for existing superadmin:', err);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('A superadmin already exists. Cannot create another one.');
        process.exit(1);
      }

      rl.question('Enter username for superadmin: ', (username) => {
        rl.question('Enter password for superadmin: ', (password) => {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.error('Error hashing password:', err);
              process.exit(1);
            }

            const query =
              'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
            db.query(query, [username, hash, 0], (err, result) => {
              if (err) {
                console.error('Error creating superadmin:', err);
                process.exit(1);
              }
              console.log('Superadmin created successfully.');
              db.end();
              rl.close();
            });
          });
        });
      });
    }
  );
});
