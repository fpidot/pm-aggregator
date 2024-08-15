import { Contract, UserPreferences } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // Adjust this to your backend URL

export async function fetchContractsFromAPI(): Promise<{ contracts: Contract[], categories: string[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function updateUserPreferencesAPI(preferences: UserPreferences): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE_URL}/subscribers/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    throw new Error('Failed to update user preferences');
  }
  return response.json();
}

// You can add more API functions here as needed