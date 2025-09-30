import express from 'express';
import {
  getAllInventory,
  getLowStock,
  getInventoryById,
  createInventory,
  updateInventory,
  updateStock,
  deleteInventory
} from '../controllers/inventoryController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getAllInventory);
router.get('/low-stock', getLowStock);
router.get('/:id', getInventoryById);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.post('/:id/stock', updateStock);
router.delete('/:id', deleteInventory);

export default router;