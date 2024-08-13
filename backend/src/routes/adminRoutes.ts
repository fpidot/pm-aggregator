import express from 'express';
import * as adminService from '../services/adminService';

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const settings = await adminService.getAdminSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin settings', error: (error as Error).message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    await adminService.updateAdminSettings(req.body);
    res.json({ message: 'Admin settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating admin settings', error: (error as Error).message });
  }
});

router.post('/contracts/:id/follow', async (req, res) => {
  try {
    const contract = await adminService.followContract(req.params.id);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: 'Error following contract', error: (error as Error).message });
  }
});

router.post('/contracts/:id/unfollow', async (req, res) => {
  try {
    const contract = await adminService.unfollowContract(req.params.id);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: 'Error unfollowing contract', error: (error as Error).message });
  }
});

router.post('/contracts/:id/display', async (req, res) => {
  try {
    const contract = await adminService.displayContract(req.params.id);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: 'Error displaying contract', error: (error as Error).message });
  }
});

router.post('/contracts/:id/hide', async (req, res) => {
  try {
    const contract = await adminService.hideContract(req.params.id);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: 'Error hiding contract', error: (error as Error).message });
  }
});

router.put('/contracts/:id/category', async (req, res) => {
  try {
    const contract = await adminService.updateContractCategory(req.params.id, req.body.category);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contract category', error: (error as Error).message });
  }
});

export default router;