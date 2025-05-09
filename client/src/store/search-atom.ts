import { atom } from 'recoil';

// Default search mode
export type SearchMode = 'raw' | 'advanced' | 'smart';

// Search mode atom
export const searchModeAtom = atom<SearchMode>({
  key: 'searchMode',
  default: 'raw'
});

// Search query atom
export const searchQueryAtom = atom<string>({
  key: 'searchQuery',
  default: ''
});

// Search preview atom for smart search
export const searchPreviewAtom = atom<any>({
  key: 'searchPreview',
  default: null
});
