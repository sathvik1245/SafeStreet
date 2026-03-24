import { Client, Account, Avatars, Databases, Storage, ID } from 'react-native-appwrite';

// Appwrite Configuration
// TODO: Replace these values with your own Appwrite project credentials
// You can find these in your Appwrite console: https://cloud.appwrite.io/console
// For production, consider using environment variables

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('YOUR_PROJECT_ID_HERE') // Replace with your project ID
  .setPlatform('com.example.safestreetapp'); // Replace with your platform bundle ID


export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const AppwriteID = ID;

// UPDATED: Properly handle signed URLs
export const getFileUrl = (bucketId, fileId, width = 300, height = 300) => {
  const url = storage.getFilePreview(
    bucketId,
    fileId,
    width,
    height,
    undefined, // gravity
    undefined, // quality
    undefined, // borderWidth
    undefined, // borderColor
    undefined, // borderRadius
    undefined, // opacity
    undefined, // rotation
    undefined, // background
    "jpg"      // output format
  ).toString();

  // Append .jpg to the URL to ensure Appwrite recognizes it as an image
  return `${url}.jpg`;
};

// UPDATED: Properly handle signed URLs
export const getFullImageUrl = (bucketId, fileId) => {
  const url = storage.getFileView(bucketId, fileId).toString();
  return `${url}.jpg`;
};

// Add cache busting parameter
export const getCacheBustedUrl = (url) => {
  return `${url}?t=${Date.now()}`;
};