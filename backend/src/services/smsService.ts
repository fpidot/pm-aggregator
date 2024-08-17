import twilio from 'twilio';
import dotenv from 'dotenv';
import { ISubscriber } from '../models/Subscriber';
import { Category } from '../config/categories';

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string): Promise<void> {
  try {
    // Format the phone number to E.164 format
    const formattedNumber = formatPhoneNumber(to);
    const result = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    console.log(`SMS sent successfully. SID: ${result.sid}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  // Ensure the number starts with '+1' (assuming US numbers)
  return `+1${digitsOnly.slice(-10)}`;
}

export async function sendDailyUpdate(subscriber: ISubscriber, contracts: Array<{ title: string; currentPrice: number; change24h: number; category: Category }>): Promise<void> {
  const relevantContracts = contracts.filter(contract => 
    subscriber.categories.includes(contract.category)
  );

  const message = relevantContracts.map(contract => 
    `${contract.title}: Current price: $${contract.currentPrice.toFixed(2)}, 24h change: ${contract.change24h.toFixed(2)}%`
  ).join('\n');

  await sendSMS(subscriber.phoneNumber, `Daily Update:\n${message}`);
}

export async function sendBigMoveAlert(subscriber: ISubscriber, contract: { title: string; changePercent: number; changeHours: number; currentPrice: number; category: Category }): Promise<void> {
    if (subscriber.categories.includes(contract.category)) {
    await sendSMS(
      subscriber.phoneNumber,
      `Big Move Alert: ${contract.title} has moved ${contract.changePercent.toFixed(2)}% in the last ${contract.changeHours} hours. Current price: $${contract.currentPrice.toFixed(2)}`
    );
  }
}
