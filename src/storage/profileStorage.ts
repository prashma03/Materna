// Import AsyncStorage to save data on the device
import AsyncStorage from "@react-native-async-storage/async-storage";

// Name of the storage location
const PROFILE_KEY = "@materna_profile";

// Profile information that will be saved
export interface ProfileData {
  fullName: string;
  dateOfBirth: string;
  county: string;
  age: string;
  weightLbs: string;
  heightFt: string;
  heightIn: string; 
  pregnancyWeek: string;
  pregnancyWeekRecordedAt: string;
  previousPregnancies: string;
  medications: string;
  emergencyContact: string;
  preferredHospital: string;

  hasMiscarriage: boolean;
  hasHighBP: boolean;
  hasDiabetes: boolean;
  hasAnemia: boolean;
  hasCSection: boolean;
  shareWithDoctor: boolean;
  updatedAt: string;
}

export const EMPTY_PROFILE: ProfileData = {
  fullName: "",
  dateOfBirth: "",
  county: "",
  age: "",
  weightLbs: "",
  heightFt: "",
  heightIn: "",
  pregnancyWeek: "",
  pregnancyWeekRecordedAt: "",
  previousPregnancies: "",
  medications: "",
  emergencyContact: "",
  preferredHospital: "",
  hasMiscarriage: false,
  hasHighBP: false,
  hasDiabetes: false,
  hasAnemia: false,
  hasCSection: false,
  shareWithDoctor: false,
  updatedAt: "",
};

// Save the user's profile
export const saveProfile = async (profile: ProfileData) => {
  try {
    // Turn the profile into text and save it
    await AsyncStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );
  } catch (error) {
    console.log("Error saving profile:", error);
  }
};

function advancePregnancyWeek(profile: ProfileData): ProfileData {
  const savedWeek = Number(profile.pregnancyWeek);
  if (!savedWeek || !profile.pregnancyWeekRecordedAt) return profile;

  const recordedAt = new Date(profile.pregnancyWeekRecordedAt).getTime();
  if (!Number.isFinite(recordedAt)) return profile;

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const elapsedWeeks = Math.floor((Date.now() - recordedAt) / weekMs);
  if (elapsedWeeks < 1) return profile;

  return {
    ...profile,
    pregnancyWeek: String(Math.min(42, savedWeek + elapsedWeeks)),
    pregnancyWeekRecordedAt: new Date(
      recordedAt + elapsedWeeks * weekMs
    ).toISOString(),
  };
}

// Load the saved profile
export const loadProfile = async (): Promise<ProfileData | null> => {
  try {
    // Get the saved data
    const data = await AsyncStorage.getItem(PROFILE_KEY);

    // If data exists, turn it back into an object
    if (data) {
      const stored = { ...EMPTY_PROFILE, ...JSON.parse(data) };
      const updated = advancePregnancyWeek(stored);
      if (
        updated.pregnancyWeek !== stored.pregnancyWeek ||
        updated.pregnancyWeekRecordedAt !== stored.pregnancyWeekRecordedAt
      ) {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      }
      return updated;
    }

    // No profile found
    return null;
  } catch (error) {
    console.log("Error loading profile:", error);
    return null;
  }
};

// Delete the saved profile
export const clearProfile = async () => {
  try {
    // Remove the saved data
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.log("Error clearing profile:", error);
  }
};
