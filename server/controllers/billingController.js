import Billing from '../models/Billing.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

export const getAllBillings = async (req, res) => {
  try {
    const billings = await Billing.findAll({
      include: [
        {
          model: Patient,
          as: 'patient'
        },
        {
          model: Appointment,
          as: 'appointment'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(billings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillingById = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        },
        {
          model: Appointment,
          as: 'appointment'
        }
      ]
    });
    
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    res.json(billing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBilling = async (req, res) => {
  try {
    const { items, tax, discount, ...billingData } = req.body;
    
    // Calculate amounts
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalAmount = subtotal + (tax || 0) - (discount || 0);

    const billing = await Billing.create({
      ...billingData,
      items,
      tax: tax || 0,
      discount: discount || 0,
      amount: subtotal,
      totalAmount
    });

    const fullBilling = await Billing.findByPk(billing.id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        }
      ]
    });

    res.status(201).json(fullBilling);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBilling = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }

    const { items, tax, discount, ...billingData } = req.body;
    
    if (items) {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalAmount = subtotal + (tax || 0) - (discount || 0);

      await billing.update({
        ...billingData,
        items,
        tax: tax || 0,
        discount: discount || 0,
        amount: subtotal,
        totalAmount
      });
    } else {
      await billing.update(req.body);
    }

    const updatedBilling = await Billing.findByPk(billing.id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        }
      ]
    });

    res.json(updatedBilling);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }

    const { paymentMethod } = req.body;
    await billing.update({
      status: 'Paid',
      paymentMethod,
      paymentDate: new Date()
    });

    res.json({ message: 'Payment processed successfully', billing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    await billing.destroy();
    res.json({ message: 'Billing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};