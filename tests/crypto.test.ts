import { describe, it, expect } from 'vitest';
import { deriveKey, encrypt, decrypt } from '../services/crypto';

// Mock the window.crypto.subtle for testing
Object.assign(window, { crypto: require('crypto').webcrypto });

describe('Crypto Service', () => {
  const testPassphrase = 'test-passphrase-123';
  const testData = 'This is a test string for encryption';

  it('should encrypt and decrypt data successfully', async () => {
    const result = await encrypt(testData, testPassphrase);
    
    expect(result.cipher).toBeInstanceOf(ArrayBuffer);
    expect(result.iv).toBeInstanceOf(Uint8Array);
    expect(result.salt).toBeInstanceOf(Uint8Array);
    
    const decrypted = await decrypt(result.cipher, result.iv, result.salt, testPassphrase);
    expect(decrypted).toBe(testData);
  });

  it('should handle different data types for encryption', async () => {
    const testCases = [
      'Simple string',
      'Special chars: !@#$%^&*()',
      'Numbers: 123456789',
      'Unicode: 🦊 🐶 🐱',
      'JSON string: {"key": "value"}'
    ];

    for (const testCase of testCases) {
      const result = await encrypt(testCase, testPassphrase);
      const decrypted = await decrypt(result.cipher, result.iv, result.salt, testPassphrase);
      expect(decrypted).toBe(testCase);
    }
  });

  it('should not decrypt with wrong passphrase', async () => {
    const result = await encrypt(testData, 'passphrase1');
    
    // Attempting to decrypt with wrong passphrase should fail
    await expect(decrypt(result.cipher, result.iv, result.salt, 'wrong-passphrase')).rejects.toThrow();
  });

  it('should fail to decrypt with wrong salt', async () => {
    const result1 = await encrypt(testData, testPassphrase);
    const result2 = await encrypt('different data', testPassphrase);
    
    // Attempting to decrypt with wrong salt should fail
    await expect(decrypt(result1.cipher, result1.iv, result2.salt, testPassphrase)).rejects.toThrow();
  });
});