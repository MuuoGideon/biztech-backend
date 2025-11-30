// models/salesModel.js
import mongoose from 'mongoose';

const saleSchema = mongoose.Schema(
	{
		itemName: { type: String, required: true },
		quantity: { type: Number, required: true },
		pricePerUnit: { type: Number, required: true },
		costPerUnit: { type: Number, required: true }, // NEW
		totalPrice: { type: Number, required: true },
		profit: { type: Number }, // NEW
		customerName: { type: String },
		notes: { type: String },
	},
	{
		timestamps: true,
	}
);

// Optional: auto-calc profit before saving
saleSchema.pre('save', function (next) {
	this.totalPrice = this.quantity * this.pricePerUnit;
	this.profit = this.quantity * (this.pricePerUnit - this.costPerUnit);
	next();
});

export default mongoose.model('Sale', saleSchema);
