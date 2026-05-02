const DB_NAME = "my-optical-wallet-vault";
const STORE_NAME = "private-records";
const RECORD_KEY = "profiles";
const LEGACY_KEY = "my-optical-wallet-vault";

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local vault."));
  });

const withStore = async (mode, callback) => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    callback({ store, resolve, reject });

    transaction.onerror = () => reject(transaction.error || new Error("Local vault transaction failed."));
  });
};

const parseLegacyProfiles = () => {
  try {
    const rawValue = window.localStorage.getItem(LEGACY_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadVault = async () => {
  const storedProfiles = await withStore("readonly", ({ store, resolve, reject }) => {
    const request = store.get(RECORD_KEY);

    request.onsuccess = () => resolve(Array.isArray(request.result?.value) ? request.result.value : []);
    request.onerror = () => reject(request.error || new Error("Could not read local vault."));
  });

  if (storedProfiles.length > 0) {
    return storedProfiles;
  }

  const legacyProfiles = parseLegacyProfiles();
  if (legacyProfiles.length > 0) {
    await saveVault(legacyProfiles);
    window.localStorage.removeItem(LEGACY_KEY);
  }

  return legacyProfiles;
};

export const saveVault = async (profiles) =>
  withStore("readwrite", ({ store, resolve, reject }) => {
    const request = store.put({
      key: RECORD_KEY,
      updatedAt: new Date().toISOString(),
      value: profiles,
    });

    request.onsuccess = () => resolve(profiles);
    request.onerror = () => reject(request.error || new Error("Could not save to local vault."));
  });

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
