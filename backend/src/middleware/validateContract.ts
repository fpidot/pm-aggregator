import { Request, Response, NextFunction } from 'express';

export const validateContract = (req: Request, res: Response, next: NextFunction) => {
  const { title, market, category, currentPrice } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'Valid title is required' });
  }

  if (!market || typeof market !== 'string') {
    return res.status(400).json({ message: 'Valid market is required' });
  }

  if (!category || !['Elections', 'Economy', 'Geopolitics'].includes(category)) {
    return res.status(400).json({ message: 'Valid category is required (Elections, Economy, or Geopolitics)' });
  }

  if (typeof currentPrice !== 'number' || currentPrice < 0 || currentPrice > 1) {
    return res.status(400).json({ message: 'Valid currentPrice is required (between 0 and 1)' });
  }

  next();
};