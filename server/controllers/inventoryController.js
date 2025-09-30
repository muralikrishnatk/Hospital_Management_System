import Inventory from '../models/Inventory.js';

export const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      order: [['name', 'ASC']]
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const lowStock = await Inventory.findAll({
      where: {
        quantity: {
          [sequelize.Sequelize.Op.lte]: sequelize.Sequelize.col('lowStockAlert')
        },
        isActive: true
      },
      order: [['quantity', 'ASC']]
    });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    
    let newQuantity = item.quantity;
    if (operation === 'add') {
      newQuantity += quantity;
    } else if (operation === 'subtract') {
      newQuantity -= quantity;
      if (newQuantity < 0) newQuantity = 0;
    }

    await item.update({ quantity: newQuantity });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    await item.update({ isActive: false });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};