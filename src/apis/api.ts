// ============================================================================
// CONFIGURATION

import { Participant } from "../types";

// ============================================================================
const BASE_URL = "https://6938552f4618a71d77cfecbc.mockapi.io";

// Helper for Fetch Wrappers
const getEndpoint = (resource: "participants" | "settings") => {
  return `${BASE_URL}/${resource}`;
};

// --- SETTINGS API ---
export const getSettings = async (): Promise<{
  id?: string;
  targetCount: number;
  eventSummary: string;
}> => {
  try {
    const res = await fetch(getEndpoint("settings"));
    // If the 'settings' resource doesn't exist in MockAPI (returns 404), throw to catch block
    if (!res.ok) throw new Error("Settings resource not found or fetch failed");

    const data = await res.json();

    // If settings resource exists but is empty array, try to initialize it
    if (Array.isArray(data) && data.length === 0) {
      const initial = {
        targetCount: 5,
        eventSummary: "Welcome! Join our Gift Exchange.",
      };
      // Attempt to create it, but don't crash if it fails
      fetch(getEndpoint("settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initial),
      }).catch((e) => console.warn("Could not init settings", e));

      return initial;
    }

    // MockAPI returns an array, we take the first item
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    // Graceful fallback: Use default settings so the app still works
    console.warn(
      "Using default settings (Backend might be missing 'settings' resource):",
      error
    );
    return { targetCount: 5, eventSummary: "Welcome! Join our Gift Exchange." };
  }
};

export const updateSettings = async (
  targetCount: number,
  eventSummary: string
): Promise<void> => {
  try {
    const current = await getSettings();
    // If we are using defaults (no ID), we can't update properly unless we create first
    if (!current.id) return;

    await fetch(`${getEndpoint("settings")}/${current.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetCount, eventSummary }),
    });
  } catch (e) {
    console.error("Failed to update settings", e);
  }
};

// --- PARTICIPANTS API ---

export const getParticipants = async (): Promise<Participant[]> => {
  try {
    const res = await fetch(getEndpoint("participants"));
    if (!res.ok) throw new Error("Failed to fetch participants");
    const data = await res.json();
    return data.map((p: any) => ({
      ...p,
      isClaimed: p.isClaimed === true || p.isClaimed === "true",
      drawnMatchId: p.drawnMatchId || null,
      pin: p.pin || "0000",
    }));
  } catch (error) {
    console.warn("API Error (Participants). Returning empty list.", error);
    return [];
  }
};

export const addParticipant = async (
  name: string,
  wishlist: string,
  pin: string
): Promise<Participant> => {
  const newP = { name, wishlist, pin, isClaimed: false, drawnMatchId: null };

  const res = await fetch(getEndpoint("participants"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newP),
  });
  if (!res.ok) throw new Error("Failed to add participant");
  return res.json();
};

export const deleteParticipant = async (id: string): Promise<void> => {
  const res = await fetch(`${getEndpoint("participants")}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete participant");
};

export const toggleClaim = async (
  id: string,
  isClaimed: boolean
): Promise<Participant> => {
  const res = await fetch(`${getEndpoint("participants")}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isClaimed }),
  });
  if (!res.ok) throw new Error("Failed to update participant");
  return res.json();
};

export const recordDraw = async (
  pickerId: string,
  drawnId: string
): Promise<void> => {
  await fetch(`${getEndpoint("participants")}/${pickerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drawnMatchId: drawnId }),
  });
};

export const drawRandomUnclaimed = async (
  excludeId: string
): Promise<Participant | null> => {
  const all = await getParticipants();
  const valid = all.filter((p) => !p.isClaimed && p.id !== excludeId);

  if (valid.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * valid.length);
  return valid[randomIndex];
};

export const getParticipantById = async (
  id: string
): Promise<Participant | null> => {
  try {
    const res = await fetch(`${getEndpoint("participants")}/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
};
