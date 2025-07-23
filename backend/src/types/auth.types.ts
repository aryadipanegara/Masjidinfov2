export type UserPayload = {
  userId: string;
  email: string;
  role: string;
};

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
