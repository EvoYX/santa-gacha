// ------------------------------------------------------------------
// 1. PASTE YOUR MOCKAPI URL INSIDE THE QUOTES BELOW
//    It should look like: "https://670b3...mockapi.io/participants"

// ------------------------------------------------------------------
// 1. PASTE YOUR MOCKAPI URL INSIDE THE QUOTES BELOW
//    It should look like: "https://670b3...mockapi.io/participants"
import type { Participant } from "../types";

// ------------------------------------------------------------------
const API_URL = "https://6938552f4618a71d77cfecbc.mockapi.io/participants";

const STORAGE_KEY = "gacha_participants_local";
const SETTINGS_KEY = "gacha_settings_local";

// Helper to simulate network delay for local storage
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for generating IDs locally
const generateId = () => Math.random().toString(36).substr(2, 9);

// Safe JSON parse helper
const safeParse = (json: string | null): any => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to parse local storage", e);
    return null;
  }
};

export const getSettings = async (): Promise<{
  targetCount: number;
  eventSummary: string;
}> => {
  // Settings usually stay local for the admin, but could be moved to API if needed.
  // For now, we keep them local to avoid complex API structures.
  await delay(100);
  const data = safeParse(localStorage.getItem(SETTINGS_KEY));
  return {
    targetCount: data?.targetCount ?? 5,
    eventSummary:
      data?.eventSummary ??
      "Welcome to our Holiday Gift Exchange! Please enter your name and what you'd like to receive.",
  };
};

export const updateSettings = async (
  targetCount: number,
  eventSummary: string
): Promise<void> => {
  await delay(100);
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ targetCount, eventSummary })
  );
};

export const getParticipants = async (): Promise<Participant[]> => {
  if (API_URL) {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch participants");
    const data = await res.json();
    // MockAPI sometimes saves booleans as strings "true"/"false", so we sanitize it here
    return data.map((p: any) => ({
      ...p,
      isClaimed: p.isClaimed === true || p.isClaimed === "true",
    }));
  } else {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(stored);
    return Array.isArray(parsed) ? parsed : [];
  }
};

export const addParticipant = async (
  name: string,
  wishlist: string
): Promise<Participant> => {
  if (API_URL) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, wishlist, isClaimed: false }),
    });
    if (!res.ok) throw new Error("Failed to add participant");
    return res.json();
  } else {
    await delay(300);
    const list = await getParticipants();
    const newP: Participant = {
      id: generateId(),
      name,
      wishlist,
      isClaimed: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, newP]));
    return newP;
  }
};

export const deleteParticipant = async (id: string): Promise<void> => {
  if (API_URL) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete participant");
  } else {
    await delay(300);
    const list = await getParticipants();
    const updated = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

export const toggleClaim = async (
  id: string,
  isClaimed: boolean
): Promise<Participant> => {
  if (API_URL) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isClaimed }),
    });
    if (!res.ok) throw new Error("Failed to update participant");
    return res.json();
  } else {
    await delay(300);
    const list = await getParticipants();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Participant not found");

    list[index].isClaimed = isClaimed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list[index];
  }
};

export const drawRandomUnclaimed = async (): Promise<Participant | null> => {
  const all = await getParticipants();
  const unclaimed = all.filter((p) => !p.isClaimed);

  if (unclaimed.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * unclaimed.length);
  return unclaimed[randomIndex];
};
