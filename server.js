import express from 'express';
import cors from 'cors';
import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config();
import errorHandler from './middleware/errorMiddleware.js';
import saleRoutes from './routes/saleRoutes.js';
import userRoutes from './routes/userRoutes.js';

import connectDB from './config/db.js';

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize express
const app = express();

app.use(
	cors({
		origin: 'https://biztech-frontend.vercel.app',
		credentials: true, // if sending cookies or credentials
	})
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sales API routes
app.use('/api/sales', saleRoutes);
app.use('/', userRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(port, () =>
	console.log(`Server running on port: ${port}`.green.bold)
);
