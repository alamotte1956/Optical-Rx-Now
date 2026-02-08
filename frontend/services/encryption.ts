import * as SecureStore from 'expo-secure-store';
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';
const KEY_VERSION_KEY = 'app_encryption_key_version';
const CURRENT_KEY_VERSION = 1;

/**
 * Generate or retrieve encryption key
 */
export const getEncryptionKey = async (): Promise<string> => {
  try {
    let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    
    if (!key) {
      console.log('Generating new encryption key...');
      // Generate new 256-bit key using hex encoding
      key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
      
      if (key.length !== 64) { // 32 bytes * 2 hex chars = 64
        throw new Error('Generated key has invalid length');
      }
      
      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
      await SecureStore.setItemAsync(KEY_VERSION_KEY, CURRENT_KEY_VERSION.toString());
      console.log('Encryption key generated and stored successfully');
    } else {
      // Validate key length
      if (key.length !== 64) {
        console.error('Invalid encryption key length, regenerating...');
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
        return getEncryptionKey();
      }
      console.log('Using existing encryption key');
    }
    
    return key;
  } catch (error: any) {
    console.error('Error getting encryption key:', error);
    throw new Error(`Failed to get encryption key: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get current key version
 */
export const getKeyVersion = async (): Promise<number> => {
  try {
    const version = await SecureStore.getItemAsync(KEY_VERSION_KEY);
    return version ? parseInt(version, 10) : CURRENT_KEY_VERSION;
  } catch {
    return CURRENT_KEY_VERSION;
  }
};

/**
 * Encrypt data with AES-256
 */
export const encryptData = async (data: any): Promise<string> => {
  try {
    if (data === null || data === undefined) {
      throw new Error('Cannot encrypt null or undefined data');
    }

    const key = await getEncryptionKey();
    const jsonString = JSON.stringify(data);
    
    // Validate data size (prevent encrypting massive objects)
    if (jsonString.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Data too large to encrypt (max 10MB)');
    }
    
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    
    // Add metadata for validation
    const metadata = {
      v: await getKeyVersion(),
      t: Date.now(),
      d: encrypted,
    };
    
    return CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(JSON.stringify(metadata))
    );
  } catch (error: any) {
    console.error('Error encrypting data:', error);
    throw new Error(`Encryption failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Decrypt data
 */
export const decryptData = async (encryptedData: string): Promise<any> => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data format');
    }

    const key = await getEncryptionKey();
    
    // Parse metadata
    const metadataJson = CryptoJS.enc.Utf8.stringify(
      CryptoJS.enc.Base64.parse(encryptedData)
    );
    const metadata = JSON.parse(metadataJson);
    
    if (!metadata.d) {
      throw new Error('Invalid encrypted data format');
    }
    
    const decrypted = CryptoJS.AES.decrypt(metadata.d, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString || jsonString.length === 0) {
      throw new Error('Decryption resulted in empty string');
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Validate decrypted data
    if (parsed === null || parsed === undefined) {
      throw new Error('Decrypted data is invalid');
    }
    
    return parsed;
  } catch (error: any) {
    console.error('Error decrypting data:', error);
    
    if (error.message.includes('Malformed')) {
      throw new Error('Data is corrupted or encrypted with a different key');
    }
    
    throw new Error(`Decryption failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Encrypt base64 image
 */
export const encryptImage = async (base64Image: string): Promise<string> => {
  try {
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid image data');
    }

    // Validate base64 format
    if (!base64Image.match(/^data:image\/[a-z]+;base64,/i)) {
      throw new Error('Invalid base64 image format');
    }

    const key = await getEncryptionKey();
    
    // Validate image size
    const sizeInBytes = (base64Image.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) { // 10MB
      throw new Error('Image too large to encrypt (max 10MB)');
    }
    
    const encrypted = CryptoJS.AES.encrypt(base64Image, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    
    // Add metadata
    const metadata = {
      v: await getKeyVersion(),
      t: Date.now(),
      type: 'image',
      d: encrypted,
    };
    
    return CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(JSON.stringify(metadata))
    );
  } catch (error: any) {
    console.error('Error encrypting image:', error);
    throw new Error(`Failed to encrypt image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Decrypt base64 image
 */
export const decryptImage = async (encryptedImage: string): Promise<string> => {
  try {
    if (!encryptedImage || typeof encryptedImage !== 'string') {
      throw new Error('Invalid encrypted image data');
    }

    const key = await getEncryptionKey();
    
    // Parse metadata
    const metadataJson = CryptoJS.enc.Utf8.stringify(
      CryptoJS.enc.Base64.parse(encryptedImage)
    );
    const metadata = JSON.parse(metadataJson);
    
    if (metadata.type !== 'image') {
      throw new Error('Data is not an image');
    }
    
    if (!metadata.d) {
      throw new Error('Invalid encrypted image format');
    }
    
    const decrypted = CryptoJS.AES.decrypt(metadata.d, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const base64Image = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Decrypted image is empty');
    }
    
    // Validate decrypted image format
    if (!base64Image.match(/^data:image\/[a-z]+;base64,/i)) {
      throw new Error('Decrypted data is not a valid base64 image');
    }
    
    return base64Image;
  } catch (error: any) {
    console.error('Error decrypting image:', error);
    
    if (error.message.includes('Malformed')) {
      throw new Error('Image data is corrupted or encrypted with a different key');
    }
    
    throw new Error(`Failed to decrypt image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Validate encrypted data without decrypting
 */
export const validateEncryptedData = (encryptedData: string): boolean => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return false;
    }

    // Try to parse metadata
    const metadataJson = CryptoJS.enc.Utf8.stringify(
      CryptoJS.enc.Base64.parse(encryptedData)
    );
    const metadata = JSON.parse(metadataJson);
    
    // Check required fields
    return !!(metadata.v && metadata.t && metadata.d);
  } catch {
    return false;
  }
};

/**
 * Rotate encryption key (for future use)
 * WARNING: This requires re-encrypting all data
 */
export const rotateEncryptionKey = async (): Promise<boolean> => {
  try {
    // Delete old key
    await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
    await SecureStore.deleteItemAsync(KEY_VERSION_KEY);
    
    // Generate new key
    await getEncryptionKey();
    
    console.log('Encryption key rotated successfully');
    return true;
  } catch (error: any) {
    console.error('Error rotating encryption key:', error);
    throw new Error(`Failed to rotate key: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Check if encryption is available
 */
export const isEncryptionAvailable = async (): Promise<boolean> => {
  try {
    const key = await getEncryptionKey();
    return !!key;
  } catch {
    return false;
  }
};

/**
 * Test encryption/decryption
 */
export const testEncryption = async (): Promise<boolean> => {
  try {
    const testData = { test: 'Hello, World!', timestamp: Date.now() };
    const encrypted = await encryptData(testData);
    const decrypted = await decryptData(encrypted);
    
    return (
      decrypted.test === testData.test &&
      decrypted.timestamp === testData.timestamp
    );
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
};

/**
 * Clear encryption key (for testing/reset)
 * WARNING: This will make all encrypted data inaccessible
 */
export const clearEncryptionKey = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
    await SecureStore.deleteItemAsync(KEY_VERSION_KEY);
    console.log('Encryption key cleared');
    return true;
  } catch (error: any) {
    console.error('Error clearing encryption key:', error);
    throw new Error(`Failed to clear key: ${error.message || 'Unknown error'}`);
  }
};