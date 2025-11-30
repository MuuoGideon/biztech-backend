import express from 'express';
import {
	getSales,
	getSale,
	setSale,
	updateSale,
	deleteSale,
} from '../controllers/saleController.js';

const router = express.Router();

/* ---------------------------------------------
   ROUTES
--------------------------------------------- */

// GET all sales & CREATE new sale (image optional)
router.route('/').get(getSales).post(setSale);

// GET single sale
router.route('/:id').get(getSale).put(updateSale).delete(deleteSale);

export default router;
