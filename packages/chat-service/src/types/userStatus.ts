export type StatusType = 'Available' | 'Away' | 'Busy' | 'Offline';

export interface UserPresence {
  userId: string;
  status: StatusType;
  customNote?: string;
}