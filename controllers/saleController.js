// controllers/salesController.js
import asyncHandler from 'express-async-handler';
import Sales from '../models/salesModel.js';

/* =====================================================
   GET ALL SALES (WITH SEARCH SUPPORT BY ITEMNAME OR DATE)
===================================================== */
const getSales = asyncHandler(async (req, res) => {
	const { search } = req.query;

	let filter = {};

	if (search) {
		filter = {
			$or: [
				{ itemName: { $regex: search, $options: 'i' } }, // case-insensitive
				{ date: { $regex: search, $options: 'i' } }, // assumes date stored as string (YYYY-MM-DD)
			],
		};
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
   CREATE NEW SALE
===================================================== */
const setSale = asyncHandler(async (req, res) => {
	const { itemName, quantity, pricePerUnit, costPerUnit } = req.body;

	if (
		!itemName ||
		quantity == null ||
		pricePerUnit == null ||
		costPerUnit == null
	) {
		return res
			.status(400)
			.json({ message: 'All required fields must be provided' });
	}

	const newSale = new Sales(req.body);
	const sale = await newSale.save();

	res.status(201).json(sale);
});

/* =====================================================
   UPDATE SALE
===================================================== */
const updateSale = asyncHandler(async (req, res) => {
	const sale = await Sales.findById(req.params.id);
	if (!sale) return res.status(404).json({ message: 'Sale not found' });

	const { itemName, quantity, pricePerUnit, costPerUnit, customerName, notes } =
		req.body;

	sale.itemName = itemName ?? sale.itemName;
	sale.quantity = quantity ?? sale.quantity;
	sale.pricePerUnit = pricePerUnit ?? sale.pricePerUnit;
	sale.costPerUnit = costPerUnit ?? sale.costPerUnit;
	sale.customerName = customerName ?? sale.customerName;
	sale.notes = notes ?? sale.notes;

	// Manual recalculation of totalPrice and profit
	sale.totalPrice = sale.quantity * sale.pricePerUnit;
	sale.profit = (sale.pricePerUnit - sale.costPerUnit) * sale.quantity;

	const updatedSale = await sale.save();
	res.status(200).json(updatedSale);
});

/* =====================================================
   DELETE SALE
===================================================== */
const deleteSale = asyncHandler(async (req, res) => {
	const sale = await Sales.findById(req.params.id);
	if (!sale) return res.status(404).json({ message: 'Sale not found' });

	await sale.deleteOne();
	res
		.status(200)
		.json({ id: req.params.id, message: 'Sale deleted successfully' });
});

export { getSales, getSale, setSale, updateSale, deleteSale };
