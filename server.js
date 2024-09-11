import app from './src/app.js';

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log(`Connected to backend at :${PORT}`);
});
