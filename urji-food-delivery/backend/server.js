import express from 'express';
import cors from 'cors';
import { PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));