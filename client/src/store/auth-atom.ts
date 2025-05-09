import { atom } from 'recoil';
import { User } from '@shared/schema';

export interface AuthState {
  user: User | null;
}

export const authAtom = atom<AuthState>({
  key: 'authState',
  default: {
    user: null
  }
});
