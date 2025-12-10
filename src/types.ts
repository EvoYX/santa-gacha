export interface Participant {
  id: string;
  name: string;
  wishlist: string;
  pin: string; // 4-digit security pin
  isClaimed: boolean;
  drawnMatchId?: string | null; // The ID of the person this participant has drawn
}
// https://6938552f4618a71d77cfecbc.mockapi.io/participants
export type DrawState = "idle" | "drawing" | "dropped" | "revealed" | "empty";
