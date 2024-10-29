import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import uploadRoutes from './routes/uploadRoutes.js';
import indexRoute from './routes/indexRoute.js';
import flockRoutes from './routes/flockRoutes.js';
import flockDetailRoutes from './routes/flockDetailRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static('public'));
app.use(express.json());

const corsOptions = {
  origin: '*', // Be cautious with this in production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
// Add this line to serve files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use('/index', indexRoute);
app.use('/flock', flockRoutes);
app.use('/flock-details', flockDetailRoutes);

export default app;
