// routes/productRoutes.js
import express from 'express';
import {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// GET all products, POST new product
router.route('/').get(getProducts).post(createProduct);

// PUT update product, DELETE product
router
	.route('/:id')
	.get(getProductById)
	.put(updateProduct)
	.delete(deleteProduct);

export default router;
