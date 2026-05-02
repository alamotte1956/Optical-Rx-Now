import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { loadVault, saveVault } from "@/lib/vault-storage";

const VaultContext = createContext(null);

const createId = () => window.crypto?.randomUUID?.() || `profile-${Date.now()}`;

const normalizeReminder = (reminder = {}) => ({
  enabled: Boolean(reminder.enabled),
  cadence: reminder.cadence || "monthly",
  customDays: reminder.customDays || "",
  startDate: reminder.startDate || new Date().toISOString().slice(0, 10),
});

const normalizeProfile = (profile) => ({
  id: profile.id || createId(),
  name: profile.name?.trim() || "Untitled profile",
  pd: profile.pd || "",
  prescriptionPhoto: profile.prescriptionPhoto || "",
  expirationDate: profile.expirationDate || "",
  prescriptionUpdatedAt: profile.prescriptionUpdatedAt || "",
  warrantyPhoto: profile.warrantyPhoto || "",
  warrantyUpdatedAt: profile.warrantyUpdatedAt || "",
  reminder: normalizeReminder(profile.reminder),
  expirationReminderDays: Number(profile.expirationReminderDays) || 30,
  createdAt: profile.createdAt || new Date().toISOString(),
  updatedAt: profile.updatedAt || new Date().toISOString(),
});

export const VaultProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hydrateVault = async () => {
      const storedProfiles = await loadVault();
      setProfiles(storedProfiles.map(normalizeProfile));
      setIsLoaded(true);
    };

    hydrateVault();
  }, []);

  const persistProfiles = async (nextProfiles) => {
    const normalizedProfiles = nextProfiles.map(normalizeProfile);
    await saveVault(normalizedProfiles);
    setProfiles(normalizedProfiles);
    return normalizedProfiles;
  };

  const upsertProfile = async (profileInput) => {
    const profileId = profileInput.id || createId();
    const existingProfile = profiles.find((profile) => profile.id === profileId);
    const nextProfile = normalizeProfile({
      ...existingProfile,
      ...profileInput,
      id: profileId,
      updatedAt: new Date().toISOString(),
    });

    const nextProfiles = existingProfile
      ? profiles.map((profile) => (profile.id === profileId ? nextProfile : profile))
      : [nextProfile, ...profiles];

    return persistProfiles(nextProfiles);
  };

  const savePrescription = async (profileId, prescriptionInput) => {
    const targetProfile = profiles.find((profile) => profile.id === profileId);
    if (!targetProfile) {
      throw new Error("Profile not found.");
    }

    const nextProfile = normalizeProfile({
      ...targetProfile,
      prescriptionPhoto: prescriptionInput.photoDataUrl,
      expirationDate: prescriptionInput.expirationDate,
      prescriptionUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return persistProfiles(
      profiles.map((profile) => (profile.id === profileId ? nextProfile : profile)),
    );
  };

  const saveWarrantyPhoto = async (profileId, warrantyPhoto) => {
    const targetProfile = profiles.find((profile) => profile.id === profileId);
    if (!targetProfile) {
      throw new Error("Profile not found.");
    }

    const nextProfile = normalizeProfile({
      ...targetProfile,
      warrantyPhoto,
      warrantyUpdatedAt: warrantyPhoto ? new Date().toISOString() : "",
      updatedAt: new Date().toISOString(),
    });

    return persistProfiles(
      profiles.map((profile) => (profile.id === profileId ? nextProfile : profile)),
    );
  };

  const saveReminder = async (profileId, reminderInput) => {
    const targetProfile = profiles.find((profile) => profile.id === profileId);
    if (!targetProfile) {
      throw new Error("Profile not found.");
    }

    const nextProfile = normalizeProfile({
      ...targetProfile,
      reminder: normalizeReminder(reminderInput),
      expirationReminderDays:
        Number(reminderInput.expirationReminderDays || targetProfile.expirationReminderDays) || 30,
      updatedAt: new Date().toISOString(),
    });

    return persistProfiles(
      profiles.map((profile) => (profile.id === profileId ? nextProfile : profile)),
    );
  };

  const clearPrescription = async (profileId) => {
    const targetProfile = profiles.find((profile) => profile.id === profileId);
    if (!targetProfile) {
      throw new Error("Profile not found.");
    }

    const nextProfile = normalizeProfile({
      ...targetProfile,
      prescriptionPhoto: "",
      expirationDate: "",
      prescriptionUpdatedAt: "",
      updatedAt: new Date().toISOString(),
    });

    return persistProfiles(
      profiles.map((profile) => (profile.id === profileId ? nextProfile : profile)),
    );
  };

  const deleteProfile = async (profileId) => {
    const nextProfiles = profiles.filter((profile) => profile.id !== profileId);
    return persistProfiles(nextProfiles);
  };

  const value = useMemo(
    () => ({
      profiles,
      isLoaded,
      upsertProfile,
      savePrescription,
      saveWarrantyPhoto,
      saveReminder,
      clearPrescription,
      deleteProfile,
      getProfileById: (profileId) => profiles.find((profile) => profile.id === profileId),
    }),
    [isLoaded, profiles],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = () => {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault must be used inside VaultProvider.");
  }

  return context;
};
