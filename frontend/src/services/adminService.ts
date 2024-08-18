import axios from 'axios';
import { IAdminSettingsData } from '../types/adminTypes';

const API_URL = 'http://localhost:3001/api';

export const getAdminSettings = async (): Promise<IAdminSettingsData> => {
  const response = await axios.get<IAdminSettingsData>(`${API_URL}/admin/settings`);
  return response.data;
};

export const updateAdminSettings = async (settings: Partial<IAdminSettingsData>): Promise<IAdminSettingsData> => {
  const response = await axios.put<IAdminSettingsData>(`${API_URL}/admin/settings`, settings);
  return response.data;
};

export const updateBigMoveThreshold = async (category: string, threshold: number): Promise<IAdminSettingsData> => {
  const response = await axios.put<IAdminSettingsData>(`${API_URL}/admin/settings/bigMoveThreshold`, { category, threshold });
  return response.data;
};