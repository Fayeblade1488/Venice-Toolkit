// services/crypto.ts

/**
 * @fileoverview Cryptographic utilities for client-side API key encryption
 * Uses PBKDF2 for key derivation and AES-GCM for encryption
 */

/** Number of iterations for PBKDF2 key derivation (higher = more secure but slower) */
const ITERATIONS = 250000;

/**
 * Derives a cryptographic key from a user passphrase using PBKDF2
 * This key can then be used for encryption/decryption operations
 * 
 * @param passphrase - The user-provided passphrase to derive the key from
 * @param salt - The salt to use for key derivation (16 bytes recommended)
 * @returns Promise<CryptoKey> - The derived cryptographic key
 */
export async function deriveKey(passphrase: string, salt?: Uint8Array): Promise<CryptoKey> {
  // Use provided salt or generate a random one if not provided
  const actualSalt = salt || window.crypto.getRandomValues(new Uint8Array(16));
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: actualSalt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string using AES-GCM with a derived key
 * Returns both the encrypted data and the initialization vector (IV)
 * 
 * @param data - The string data to encrypt
 * @param passphrase - The user's passphrase for encryption
 * @returns Promise<{ cipher: ArrayBuffer, iv: Uint8Array, salt: Uint8Array }> - The encrypted data, IV, and salt
 */
export async function encrypt(data: string, passphrase: string): Promise<{ cipher: ArrayBuffer, iv: Uint8Array, salt: Uint8Array }> {
  // Generate a random salt for this encryption operation
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );
  return { cipher, iv, salt };
}

/**
 * Decrypts data using AES-GCM with a derived key
 * 
 * @param cipher - The encrypted data to decrypt
 * @param iv - The initialization vector used during encryption
 * @param salt - The salt used during key derivation
 * @param passphrase - The user's passphrase for decryption
 * @returns Promise<string> - The decrypted string data
 */
export async function decrypt(cipher: ArrayBuffer, iv: Uint8Array, salt: Uint8Array, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase, salt);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    cipher
  );
  return new TextDecoder().decode(decrypted);
}
