import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './src/routes/index.js'; // Impor router utama
import path from 'path'; // Impor 'path'
import { fileURLToPath } from 'url'; // Impor 'fileURLToPath'

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware global
app.use(cors());
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// == Gunakan Router Utama ==
// Semua rute Anda akan diawali dengan /api
app.use('/api', mainRouter);

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});