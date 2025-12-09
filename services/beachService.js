import { Client, Databases, Query } from 'appwrite'

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT);

const databases = new Databases(client);

export const beachService = {
  async getBeaches() {
    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABSE,
        process.env.EXPO_PUBLIC_APPWRITE_TABLE,
        [Query.limit(100)]
      );
      return response;
    } catch (error) {
      console.error('Error fetching beaches:', error);
      throw error;
    }
  }
};