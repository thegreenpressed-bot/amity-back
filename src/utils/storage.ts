/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Memory fallback to ensure the app never crashes under sandboxed iframe rules
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage item read failed. Falling back to memory storage.", e);
      return memoryStorage[key] || null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage item write failed. Falling back to memory storage.", e);
      memoryStorage[key] = value;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage item delete failed.", e);
      delete memoryStorage[key];
    }
  }
};
