import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },

		quantity: { type: Number, required: true, default: 0 },

		costPerUnit: { type: Number, required: true },

		sellingPricePerUnit: { type: Number, required: true },

		lowStockAlert: { type: Number, default: 5 },
	},
	{ timestamps: true }
);

export default mongoose.model('Product', productSchema);
