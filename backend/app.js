import 'dotenv/config';
import express from 'express';
import AuthRoutes from './routes/AuthRoutes.js';
import AdsRoutes from './routes/AdsRoutes.js';
import CategoriesRoutes from './routes/CategoriesRoutes.js';
import FavRoutes from './routes/FavRoutes.js';
import connectMongoDB from './config/mongodb.js';
import MessageRoutes from './routes/MessageRoutes.js';
import ProfileRoutes from './routes/ProfileRoutes.js';
import PTRoutes from './routes/PTRoutes.js';
import ReviewRoutes from './routes/ReviewRoutes.js';
import transactionController from './controllers/PTController.js'
import cookieParser from "cookie-parser";
import errorMiddleware from './middleware/centralError.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TownsRoutes from './routes/TownsRoutes.js';
import UsersRoutes from './routes/UsersRoutes.js';


const app = express();
connectMongoDB();
const __filename = fileURLToPath(import.meta.url);

app.post('/transactions/webhook', express.raw({ type: 'application/json' }), transactionController.handleWebhook);

// Middlewares globaux
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Routes
app.use('/ads', AdsRoutes); //monte les routes sur Express, attention au chemin dans routes
app.use('/categories', CategoriesRoutes);
app.use('/favorites', FavRoutes);
app.use('/messages', MessageRoutes);
app.use('/reviews', ReviewRoutes);
app.use('/profile', ProfileRoutes);
app.use('/transactions', PTRoutes);
app.use('/payments', PTRoutes);
app.use("/auth", AuthRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/towns', TownsRoutes);
app.use('/users', UsersRoutes);

// Middleware d'erreur
app.use(errorMiddleware);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});