import { Folder as SchemaFolder } from '@shared/schema';

// Extend the Folder type from the schema if needed
export interface FolderWithUIState extends SchemaFolder {
  isSelected?: boolean;
  isHovered?: boolean;
  isExpanded?: boolean;
}

// Folder item count
export interface FolderItemCount {
  folderId: number;
  fileCount: number;
  folderCount: number;
}

// Folder breadcrumb
export interface FolderBreadcrumb {
  id: number;
  name: string;
  path: string;
}

// Folder tree node for hierarchical view
export interface FolderTreeNode {
  id: number;
  name: string;
  path: string;
  isRoot: boolean;
  children: FolderTreeNode[];
  level: number;
}
