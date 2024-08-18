import Contract, { IContract } from '../models/Contract';
import Subscriber, { ISubscriber } from '../models/Subscriber';
import { sendSMS } from './smsService';
import { getAdminSettings, AlertSettings } from './adminService';
import AdminSettings from '../models/AdminSettings';

export const sendDailyUpdate = async (): Promise<void> => {
  const adminSettings = await getAdminSettings();
  const subscribers = await Subscriber.find({ 'alertPreferences.dailyUpdates': true });
  const displayedContracts = await Contract.find({ isDisplayed: true });

  for (const subscriber of subscribers) {
    let message = 'Daily Update:\n';

    for (const category of adminSettings.categories) {
      if (subscriber.categories.includes(category)) {
        const categoryContracts = displayedContracts.filter((c: IContract) => c.category === category);
        message += `\n${category}:\n`;
        for (const contract of categoryContracts) {
          const priceChange = contract.currentPrice - (contract.priceHistory[0]?.price || contract.currentPrice);
          message += `${contract.title}: ${contract.currentPrice.toFixed(2)} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} / 24h)\n`;
        }
      }
    }

    await sendSMS(subscriber.phoneNumber, message);
  }
};

export const checkBigMoves = async (): Promise<void> => {
  const settings = await getAdminSettings();
  if (!settings) {
    console.error('Admin settings not found');
    return;
  }

  const displayedContracts = await Contract.find({ isDisplayed: true });
  const subscribers = await Subscriber.find({ 'alertPreferences.bigMoves': true });

  for (const contract of displayedContracts) {
    const threshold = settings.bigMoveThresholds.get(contract.category) || settings.defaultBigMoveThreshold;
    const timeWindowMs = settings.bigMoveTimeWindow * 60 * 60 * 1000; // Convert hours to milliseconds
    
    if (!contract.lastAlertPrice || !contract.lastAlertTime) {
      continue; // Skip if we don't have previous alert data
    }

    const priceDiff = contract.currentPrice - contract.lastAlertPrice;

    if (Math.abs(priceDiff) >= threshold && Date.now() - contract.lastAlertTime.getTime() > timeWindowMs) {
      const message = createBigMoveMessage(contract, priceDiff);

      for (const subscriber of subscribers) {
        if (subscriber.categories.includes(contract.category)) {
          await sendSMS(subscriber.phoneNumber, message);
        }
      }

      contract.lastAlertPrice = contract.currentPrice;
      contract.lastAlertTime = new Date();
      await contract.save();
    }
  }
};

const createBigMoveMessage = (contract: IContract, priceDiff: number): string => {
  const oneHourAgoPrice = contract.priceHistory.find(ph => ph.timestamp.getTime() <= Date.now() - 60 * 60 * 1000)?.price;
  const twentyFourHourAgoPrice = contract.priceHistory.find(ph => ph.timestamp.getTime() <= Date.now() - 24 * 60 * 60 * 1000)?.price;

  const oneHourChange = oneHourAgoPrice ? contract.currentPrice - oneHourAgoPrice : null;
  const twentyFourHourChange = twentyFourHourAgoPrice ? contract.currentPrice - twentyFourHourAgoPrice : null;

  let message = `Big move alert: ${contract.title}\n`;
  message += `Current price: ${contract.currentPrice.toFixed(2)}\n`;
  message += `Change: ${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)}\n`;
  if (oneHourChange !== null) {
    message += `1h change: ${oneHourChange >= 0 ? '+' : ''}${oneHourChange.toFixed(2)}\n`;
  }
  if (twentyFourHourChange !== null) {
    message += `24h change: ${twentyFourHourChange >= 0 ? '+' : ''}${twentyFourHourChange.toFixed(2)}`;
  }

  return message;
};

export const handleUserCommand = async (phoneNumber: string, command: string): Promise<string> => {
  const subscriber = await Subscriber.findOne({ phoneNumber });
  if (!subscriber) {
    return "You are not subscribed to any alerts. Please visit our website to subscribe.";
  }

  switch (command.toLowerCase()) {
    case 'stop':
      await Subscriber.deleteOne({ phoneNumber });
      return "You have been unsubscribed. Text 'resume' to resubscribe.";
    case 'mute':
      subscriber.mutedUntil = new Date(new Date().setHours(23, 59, 59, 999));
      await subscriber.save();
      return "Alerts muted for the rest of the day. Text 'resume' to unmute.";
    case 'resume':
      subscriber.mutedUntil = undefined;
      await subscriber.save();
      return "Your alerts have been resumed.";
    case 'help':
      return "Available commands: stop (unsubscribe), mute (silence for today), resume (reactivate alerts), help (show this message)";
    default:
      return "Unrecognized command. Text 'help' for a list of available commands.";
  }
};

export const sendConfirmationCode = async (phoneNumber: string, code: string): Promise<void> => {
  const message = `Your confirmation code is: ${code}. Please enter this code on the website to complete your subscription.`;
  await sendSMS(phoneNumber, message);
};

export const sendWelcomeMessage = async (phoneNumber: string): Promise<void> => {
  const message = "Welcome to Prediction Market Alerts! You can text 'stop' to unsubscribe, 'mute' to silence alerts for today, 'resume' to reactivate alerts, or 'help' for more information.";
  await sendSMS(phoneNumber, message);
};