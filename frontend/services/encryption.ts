import * as SecureStore from 'expo-secure-store';
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';

// Generate or retrieve encryption key
export const getEncryptionKey = async (): Promise<string> => {
  try {
    let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (!key) {
      console.log('Generating new encryption key...');
      // Generate new 256-bit key using hex encoding
      key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
      console.log('Encryption key generated and stored successfully');
    } else {
      console.log('Using existing encryption key');
    }
    return key;
  } catch (error) {
    console.error('Error getting encryption key:', error);
    throw new Error(`Failed to get encryption key: ${error.message}`);
  }
};

// Encrypt data
export const encryptData = async (data: any): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

// Decrypt data
export const decryptData = async (encryptedData: string): Promise<any> => {
  try {
    const key = await getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) {
      throw new Error('Decryption resulted in empty string');
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Encrypt base64 image
export const encryptImage = async (base64Image: string): Promise<string> => {
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(base64Image, key).toString();
};

// Decrypt base64 image
export const decryptImage = async (encryptedImage: string): Promise<string> => {
  const key = await getEncryptionKey();
  const decrypted = CryptoJS.AES.decrypt(encryptedImage, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};
