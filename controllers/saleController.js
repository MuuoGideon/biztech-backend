// controllers/salesController.js
import asyncHandler from 'express-async-handler';
import Sales from '../models/salesModel.js';
import Product from '../models/productModel.js';

/* =====================================================
   GET ALL SALES (WITH SEARCH BY PRODUCT NAME + DATE RANGE)
===================================================== */
const getSales = asyncHandler(async (req, res) => {
	const { search, from, to } = req.query;
	let filter = {};

	// 1. Search by product name
	if (search) {
		filter.itemName = { $regex: search, $options: 'i' };
	}

	// 2. Filter by date range
	if (from || to) {
		const startDate = from ? new Date(from) : new Date('1970-01-01');
		const endDate = to ? new Date(to) : new Date();
		endDate.setHours(23, 59, 59, 999);

		filter.createdAt = { $gte: startDate, $lte: endDate };
	}

	const sales = await Sales.find(filter).sort({ createdAt: -1 });
	res.status(200).json(sales);
});

/* =====================================================
   GET SINGLE SALE
===================================================== */
const getSale = asyncHandler(async (req, res) => {
	const sale = await Sales.findById(req.params.id);

	if (!sale) {
		return res.status(404).json({ message: 'Sale not found' });
	}

	res.status(200).json(sale);
});

/* =====================================================
   CREATE NEW SALE (AUTO-DEDUCT STOCK)
===================================================== */
const setSale = asyncHandler(async (req, res) => {
	const {
		productId,
		quantity,
		pricePerUnit,
		costPerUnit,
		customerName,
		notes,
	} = req.body;

	if (!productId || !quantity || pricePerUnit == null || costPerUnit == null) {
		return res
			.status(400)
			.json({ message: 'All required fields must be provided' });
	}

	// Find the product
	const product = await Product.findById(productId);
	if (!product) return res.status(404).json({ message: 'Product not found' });

	// Check stock
	if (product.quantity < quantity) {
		return res.status(400).json({
			message: `Not enough stock. Available: ${product.quantity}`,
		});
	}

	// Deduct stock
	product.quantity -= quantity;
	await product.save();

	// Create sale
	const sale = await Sales.create({
		product: productId,
		itemName: product.name, // for easy display/search
		quantity,
		pricePerUnit,
		costPerUnit,
		customerName,
		notes,
		totalPrice: quantity * pricePerUnit,
		profit: (pricePerUnit - costPerUnit) * quantity,
	});

	res.status(201).json(sale);
});

/* =====================================================
   UPDATE SALE (ADJUST STOCK ACCORDINGLY)
===================================================== */
const updateSale = asyncHandler(async (req, res) => {
	const sale = await Sales.findById(req.params.id);
	if (!sale) return res.status(404).json({ message: 'Sale not found' });

	const {
		productId,
		quantity,
		pricePerUnit,
		costPerUnit,
		customerName,
		notes,
	} = req.body;

	// Find the product (use new product if changed, else old one)
	const product = await Product.findById(productId || sale.product);
	if (!product) return res.status(404).json({ message: 'Product not found' });

	// Return old quantity to stock first
	product.quantity += sale.quantity;

	// Check if new quantity is available
	if (product.quantity < quantity) {
		return res.status(400).json({
			message: `Not enough stock. Available: ${product.quantity}`,
		});
	}

	// Deduct new quantity
	product.quantity -= quantity;
	await product.save();

	// Update sale data
	sale.product = productId ?? sale.product;
	sale.itemName = product.name;
	sale.quantity = quantity ?? sale.quantity;
	sale.pricePerUnit = pricePerUnit ?? sale.pricePerUnit;
	sale.costPerUnit = costPerUnit ?? sale.costPerUnit;
	sale.customerName = customerName ?? sale.customerName;
	sale.notes = notes ?? sale.notes;

	// Recalculate totals
	sale.totalPrice = sale.quantity * sale.pricePerUnit;
	sale.profit = (sale.pricePerUnit - sale.costPerUnit) * sale.quantity;

	const updatedSale = await sale.save();
	res.status(200).json(updatedSale);
});

/* =====================================================
   DELETE SALE (RETURN STOCK TO PRODUCT)
===================================================== */
const deleteSale = asyncHandler(async (req, res) => {
	const sale = await Sales.findById(req.params.id);
	if (!sale) return res.status(404).json({ message: 'Sale not found' });

	const product = await Product.findById(sale.product);

	// Return stock when sale is deleted
	if (product) {
		product.quantity += sale.quantity;
		await product.save();
	}

	await sale.deleteOne();
	res
		.status(200)
		.json({ id: req.params.id, message: 'Sale deleted successfully' });
});

export { getSales, getSale, setSale, updateSale, deleteSale };
