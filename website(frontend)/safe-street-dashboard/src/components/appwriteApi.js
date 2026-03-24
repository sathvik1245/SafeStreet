
import { databases } from './appwriteConfig';
import { account } from './appwriteConfig';

const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_ID;

export const getDamageReports = async () => {
  try {
    const response = await databases.listDocuments(databaseId, collectionId);
    return response.documents;
  } catch (error) {
    console.error('Error fetching damage reports:', error);
    return [];
  }
};

export const getUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error("Fetch user failed:", error);
    return null;
  }
};

export const updateUserPrefs = async (name, role) => {
  try {
    return await account.updatePrefs({
      name,
      role
    });
  } catch (error) {
    console.error("Update prefs failed:", error);
    throw error;
  }
};