import * as SecureStore from 'expo-secure-store';
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';

// Generate or retrieve encryption key
export const getEncryptionKey = async (): Promise<string> => {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (!key) {
    // Generate new 256-bit key
    key = CryptoJS.lib.WordArray.random(32).toString();
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
  }
  return key;
};

// Encrypt data
export const encryptData = async (data: any): Promise<string> => {
  const key = await getEncryptionKey();
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

// Decrypt data
export const decryptData = async (encryptedData: string): Promise<any> => {
  const key = await getEncryptionKey();
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonString);
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
