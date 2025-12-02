// controllers/productController.js
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

/* =====================================================
   GET ALL PRODUCTS
===================================================== */
const getProducts = asyncHandler(async (req, res) => {
	const products = await Product.find({}).sort({ name: 1 });
	res.status(200).json(products);
});

/* =====================================================
   GET SINGLE PRODUCT BY ID
===================================================== */
const getProductById = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({ message: 'Product not found' });
	}
	res.status(200).json(product);
});

/* =====================================================
   CREATE NEW PRODUCT
===================================================== */
const createProduct = asyncHandler(async (req, res) => {
	const { name, quantity, costPerUnit, sellingPricePerUnit, lowStockAlert } =
		req.body;

	if (
		!name ||
		quantity == null ||
		costPerUnit == null ||
		sellingPricePerUnit == null
	) {
		return res
			.status(400)
			.json({ message: 'All required fields must be provided' });
	}

	const productExists = await Product.findOne({ name });
	if (productExists) {
		return res.status(400).json({ message: 'Product already exists' });
	}

	const product = await Product.create({
		name,
		quantity,
		costPerUnit,
		sellingPricePerUnit,
		lowStockAlert: lowStockAlert || 5,
	});

	res.status(201).json(product);
});

/* =====================================================
   UPDATE PRODUCT (Stock or Price)
===================================================== */
const updateProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) return res.status(404).json({ message: 'Product not found' });

	const { name, quantity, costPerUnit, sellingPricePerUnit, lowStockAlert } =
		req.body;

	product.name = name ?? product.name;
	product.quantity = quantity ?? product.quantity;
	product.costPerUnit = costPerUnit ?? product.costPerUnit;
	product.sellingPricePerUnit =
		sellingPricePerUnit ?? product.sellingPricePerUnit;
	product.lowStockAlert = lowStockAlert ?? product.lowStockAlert;

	const updatedProduct = await product.save();
	res.status(200).json(updatedProduct);
});

/* =====================================================
   DELETE PRODUCT
===================================================== */
const deleteProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) return res.status(404).json({ message: 'Product not found' });

	await product.deleteOne();
	res
		.status(200)
		.json({ id: req.params.id, message: 'Product deleted successfully' });
});

export {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
};
