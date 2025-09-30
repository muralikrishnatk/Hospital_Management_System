import express from 'express';
import {
  getAllBillings,
  getBillingById,
  createBilling,
  updateBilling,
  processPayment,
  deleteBilling
} from '../controllers/billingController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getAllBillings);
router.get('/:id', getBillingById);
router.post('/', createBilling);
router.put('/:id', updateBilling);
router.post('/:id/process-payment', processPayment);
router.delete('/:id', deleteBilling);

export default router;