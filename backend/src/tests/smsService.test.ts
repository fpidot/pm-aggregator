import { sendSMS } from '../services/smsService';
import twilio from 'twilio';
import { ISubscriber } from '../models/Subscriber';

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

describe('SMS Service', () => {
  const mockSubscriber: Partial<ISubscriber> = {
    phoneNumber: '+1234567890',
    categories: ['Elections', 'Economy'],
    alertPreferences: {
      dailyUpdates: true,
      bigMoves: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an SMS message', async () => {
    const message = 'Test message';

    await sendSMS(mockSubscriber.phoneNumber!, message);

    expect(twilio).toHaveBeenCalled();
    expect(twilio().messages.create).toHaveBeenCalledWith({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mockSubscriber.phoneNumber,
    });
  });

  it('should throw an error if SMS sending fails', async () => {
    const errorMessage = 'Failed to send SMS';
    (twilio().messages.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(sendSMS(mockSubscriber.phoneNumber!, 'Test message')).rejects.toThrow(errorMessage);
  });
});