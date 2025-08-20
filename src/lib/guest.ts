/**
 * Gets or creates a persistent guest device ID
 * Priority: httpOnly cookie → localStorage → generate new
 * Stores in both localStorage and httpOnly cookie for persistence across auth events
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const STORAGE_KEY = 'guestDeviceId';

  try {
    // First, try to sync with server cookie via our device API
    const syncResponse = await fetch('/api/guest/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get' }),
    });

    if (syncResponse.ok) {
      const { deviceId: cookieId } = await syncResponse.json();
      if (cookieId && cookieId.length > 0) {
        // Update localStorage to match cookie
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(STORAGE_KEY, cookieId);
          }
        } catch (error) {
          console.warn('Failed to update localStorage with cookie value:', error);
        }
        return cookieId;
      }
    }
  } catch (error) {
    console.warn('Failed to sync with server cookie:', error);
  }

  try {
    // Fallback to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingId = localStorage.getItem(STORAGE_KEY);
      if (existingId && existingId.length > 0) {
        // Set the cookie to match localStorage
        try {
          await fetch('/api/guest/device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set', deviceId: existingId }),
          });
        } catch (error) {
          console.warn('Failed to set cookie from localStorage:', error);
        }
        return existingId;
      }
    }
  } catch (error) {
    console.warn('localStorage not available for guest device ID:', error);
  }

  // Generate new UUID v4 using crypto API
  const newId = crypto.randomUUID();

  try {
    // Store in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, newId);
    }
  } catch (error) {
    console.warn('Failed to store guest device ID in localStorage:', error);
  }

  try {
    // Set httpOnly cookie via server route
    await fetch('/api/guest/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', deviceId: newId }),
    });
  } catch (error) {
    console.warn('Failed to set guest device ID cookie:', error);
  }

  return newId;
}

/**
 * Synchronous version for backwards compatibility
 * Uses localStorage only - async version should be preferred
 */
export function getGuestDeviceId(): string {
  const STORAGE_KEY = 'guestDeviceId';

  try {
    // Try to get existing ID from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingId = localStorage.getItem(STORAGE_KEY);
      if (existingId && existingId.length > 0) {
        return existingId;
      }
    }
  } catch (error) {
    console.warn('localStorage not available for guest device ID:', error);
  }

  // Generate new UUID v4 using crypto API
  const newId = crypto.randomUUID();

  try {
    // Try to store in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, newId);
    }
  } catch (error) {
    console.warn('Failed to store guest device ID in localStorage:', error);
  }

  return newId;
}
