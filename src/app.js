import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import indexRoute from './routes/indexRoute.js';
import flockRoutes from './routes/flockRoutes.js';
import flockDetailRoutes from './routes/flockDetailRoutes.js';
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
// app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/index', indexRoute);
app.use('/flock', flockRoutes);
app.use('/flock-details', flockDetailRoutes);

export default app;
