import express from 'express';
import Contract from '../models/Contract';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const newContract = new Contract(req.body);
    const savedContract = await newContract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contract', error });
  }
});

export default router;