import Subscriber, { ISubscriber } from '../models/Subscriber';
import { Category } from '../config/categories';
import { FilterQuery } from 'mongoose';

export async function addSubscriber(subscriberData: Omit<ISubscriber, '_id'>): Promise<ISubscriber> {
  const subscriber = new Subscriber(subscriberData);
  return await subscriber.save();
}

export async function getSubscribers(filter: FilterQuery<ISubscriber> = {}): Promise<ISubscriber[]> {
  return await Subscriber.find(filter).exec();
}

export async function updateSubscriber(
  phoneNumber: string, 
  updateData: Partial<ISubscriber>
): Promise<ISubscriber | null> {
  return await Subscriber.findOneAndUpdate({ phoneNumber }, updateData, { new: true }).exec();
}

export async function deleteSubscriber(phoneNumber: string): Promise<boolean> {
  const result = await Subscriber.deleteOne({ phoneNumber }).exec();
  return result.deletedCount > 0;
}

export async function getSubscribersByCategory(category: Category): Promise<ISubscriber[]> {
  return await Subscriber.find({ categories: category }).exec();
}