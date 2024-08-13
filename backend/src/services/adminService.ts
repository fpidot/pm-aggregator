import AdminSettings, { IAdminSettings } from '../models/AdminSettings';

export type AlertSettings = IAdminSettings;

export const getAdminSettings = async (): Promise<AlertSettings> => {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    throw new Error('Admin settings not found');
  }
  return settings;
};

export const updateAdminSettings = async (newSettings: Partial<AlertSettings>): Promise<void> => {
  await AdminSettings.findOneAndUpdate({}, newSettings, { upsert: true });
};