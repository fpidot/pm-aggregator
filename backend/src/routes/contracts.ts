import express from 'express';
import Contract from '../models/Contract';
import { validateContract } from '../middleware/validateContract';

const router = express.Router();

const handleError = (error: unknown, res: express.Response, message: string) => {
    console.error(message, error);
    res.status(500).json({ message, error: error instanceof Error ? error.message : String(error) });
  };

// Get all contracts
router.get('/', async (req, res) => {
    try {
      const contracts = await Contract.find();
      res.json(contracts);
    } catch (error: unknown) {
      handleError(error, res, 'Error fetching contracts');
    }
  });
  
  // Get a single contract by ID
  router.get('/:id', async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      res.json(contract);
    } catch (error: unknown) {
      handleError(error, res, 'Error fetching contract');
    }
  });
  
  // Create a new contract
  router.post('/', validateContract, async (req, res) => {
    try {
      const newContract = new Contract(req.body);
      const savedContract = await newContract.save();
      res.status(201).json(savedContract);
    } catch (error: unknown) {
      handleError(error, res, 'Error creating contract');
    }
  });
  
  // Update a contract
  router.put('/:id', validateContract, async (req, res) => {
    try {
      const updatedContract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedContract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      res.json(updatedContract);
    } catch (error: unknown) {
      handleError(error, res, 'Error updating contract');
    }
  });
  
  // Delete a contract
  router.delete('/:id', async (req, res) => {
    try {
      const deletedContract = await Contract.findByIdAndDelete(req.params.id);
      if (!deletedContract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      res.json({ message: 'Contract deleted successfully' });
    } catch (error: unknown) {
      handleError(error, res, 'Error deleting contract');
    }
  });
  
  // Get contracts by category
  router.get('/category/:category', async (req, res) => {
    try {
      const contracts = await Contract.find({ category: req.params.category });
      res.json(contracts);
    } catch (error: unknown) {
      handleError(error, res, 'Error fetching contracts');
    }
  });
  

export default router;