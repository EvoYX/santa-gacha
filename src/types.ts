export interface Participant {
  id: string;
  name: string;
  wishlist: string;
  isClaimed: boolean;
}

export type DrawState = 'idle' | 'drawing' | 'dropped' | 'revealed' | 'empty';