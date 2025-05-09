import { atom, selector } from 'recoil';
import { File, Folder } from '@shared/schema';

// Current folder atom
export const currentFolderAtom = atom<number | null>({
  key: 'currentFolder',
  default: null
});

// Folders atom
export const foldersAtom = atom<Folder[]>({
  key: 'folders',
  default: []
});

// Files atom
export const filesAtom = atom<File[]>({
  key: 'files',
  default: []
});

// View mode atom
export const viewModeAtom = atom<'grid' | 'list'>({
  key: 'viewMode',
  default: 'grid'
});

// Recent files selector
export const recentFilesAtom = selector<File[]>({
  key: 'recentFiles',
  get: ({ get }) => {
    const files = get(filesAtom);
    // Sort by most recent first
    return [...files].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 8); // Get the 8 most recent files
  }
});

// Folder breadcrumb selector
export const folderBreadcrumbsSelector = selector<Folder[]>({
  key: 'folderBreadcrumbs',
  get: ({ get }) => {
    const currentFolderId = get(currentFolderAtom);
    const folders = get(foldersAtom);
    
    if (!currentFolderId) return [];
    
    const breadcrumbs: Folder[] = [];
    let currentFolder = folders.find(f => f.id === currentFolderId);
    
    while (currentFolder) {
      breadcrumbs.unshift(currentFolder);
      if (!currentFolder.parentId) break;
      currentFolder = folders.find(f => f.id === currentFolder?.parentId);
    }
    
    return breadcrumbs;
  }
});
