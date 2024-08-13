import { sendDailyUpdate, sendBigMoveAlert } from '../services/smsService';
import twilio from 'twilio';
import { ISubscriber } from '../models/Subscriber';
import { Category } from '../config/categories';

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test_sid' })
    }
  }))
}));

describe('SMS Service', () => {
    const mockSubscriber: ISubscriber = {
      phoneNumber: '+1234567890',
      categories: ['Elections', 'Economy'],
      receiveDailyUpdates: true,
      receiveBigMoveAlerts: true,
    } as ISubscriber;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('sendDailyUpdate formats and sends daily update for relevant categories', async () => {
      const contracts: Array<{ title: string; currentPrice: number; change24h: number; category: Category }> = [
        { title: 'Contract 1', currentPrice: 0.5, change24h: 2.5, category: 'Elections' },
        { title: 'Contract 2', currentPrice: 0.75, change24h: -1.5, category: 'Economy' },
        { title: 'Contract 3', currentPrice: 0.6, change24h: 1.0, category: 'Geopolitics' },
      ];
      await sendDailyUpdate(mockSubscriber, contracts);
    expect(twilio().messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining('Contract 1'),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1234567890'
    });
    expect(twilio().messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining('Contract 2'),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1234567890'
    });
    expect(twilio().messages.create).not.toHaveBeenCalledWith({
      body: expect.stringContaining('Contract 3'),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1234567890'
    });
  });

  test('sendBigMoveAlert sends alert only for relevant category', async () => {
    const contract: { title: string; changePercent: number; changeHours: number; currentPrice: number; category: Category } = {
      title: 'Big Mover',
      changePercent: 10,
      changeHours: 2,
      currentPrice: 0.8,
      category: 'Elections'
    };
    await sendBigMoveAlert(mockSubscriber, contract);
    expect(twilio().messages.create).toHaveBeenCalledWith({
      body: expect.stringContaining('Big Move Alert:'),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1234567890'
    });

    const irrelevantContract: { title: string; changePercent: number; changeHours: number; currentPrice: number; category: Category } = {
        ...contract,
        category: 'Geopolitics'
      };
      await sendBigMoveAlert(mockSubscriber, irrelevantContract);
  });
});