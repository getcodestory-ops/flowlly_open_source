# FilesTable Refactoring

This directory contains the refactored FilesTable components that were previously contained in a single large `FilesTable.tsx` file (1119 lines). The refactoring improves maintainability, reusability, and follows React best practices.

## File Structure

```
src/components/Folder/FilesTable/
├── README.md                   # This documentation
├── index.ts                    # Main exports
├── types.ts                    # TypeScript type definitions
├── FilesTable.tsx              # Main component (refactored)
├── FilesTableHeader.tsx        # Table header with sorting
├── FileRow.tsx                 # Individual file row component
├── FolderRow.tsx              # Individual folder row component
├── FileUploadButton.tsx        # File upload UI component
├── FileUploadProgress.tsx      # Upload progress modal
├── EmptyFilesDisplay.tsx       # Empty state component
├── useFilesTable.ts           # Hook for table logic
└── useFileUpload.ts           # Hook for upload logic
```

## Components

### Main Components

#### `FilesTable` (formerly `FilesContent`)
The main component that orchestrates all other components. Significantly reduced from 1119 lines to ~218 lines.

```tsx
import { FilesTable } from "@/components/Folder/FilesTable";

<FilesTable
  files={files}
  folders={folders}
  folderId={folderId}
  folderName={folderName}
  session={session}
  activeProject={activeProject}
  onFolderClick={onFolderClick}
/>
```

#### `FilesTableHeader`
Handles the table header with sorting functionality.

#### `FileRow`
Renders individual file rows with actions like delete and view.

#### `FolderRow`
Renders individual folder rows with navigation.

#### `FileUploadButton`
Handles file upload UI including drag-drop and text file creation.

#### `FileUploadProgress`
Shows upload progress in a floating modal with real-time status updates.

#### `EmptyFilesDisplay`
Shows empty state when no files or folders are present.

## Custom Hooks

### `useFilesTable`
Manages table state including:
- Sorting (by name, extension, date)
- Filtering/searching
- Pagination
- Data transformation

```tsx
const {
  currentItems,
  totalPages,
  sortField,
  sortDirection,
  searchTerm,
  handleSort,
  setSearchTerm,
  // ... other properties
} = useFilesTable(files, folders, filesPerPage);
```

### `useFileUpload`
Manages file upload operations:
- File upload with progress tracking
- Task status polling for processing
- Text file creation
- Error handling

```tsx
const {
  uploadingFiles,
  showUploadProgress,
  handleFileUpload,
  handleCreateTextFile,
  // ... other properties
} = useFileUpload(folderId, session, activeProject);
```

## Types

All TypeScript types are centralized in `types.ts`:

- `SortField` - Available sorting fields
- `SortDirection` - Sort direction (asc/desc)
- `ExplorerItem` - Unified file/folder item type
- `FileUploadStatus` - Upload progress tracking
- `UploadFileResponse` - API response types
- `FilesTableProps` - Main component props

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testing**: Smaller components are easier to unit test
5. **Performance**: Better opportunity for memoization
6. **Code Organization**: Logical grouping of related functionality

## Migration Guide

### Before (Original)
```tsx
import { FilesContent } from "@/components/Folder/FilesTable";
```

### After (Refactored)
```tsx
// Option 1: Use the same export name for compatibility
import { FilesContent } from "@/components/Folder/FilesTable";

// Option 2: Use the new component name
import { FilesTable } from "@/components/Folder/FilesTable";

// Option 3: Import individual components if needed
import { 
  FileRow, 
  FolderRow, 
  useFilesTable 
} from "@/components/Folder/FilesTable";
```

## Usage Examples

### Custom Implementation with Hooks
```tsx
function CustomFilesView() {
  const {
    currentItems,
    searchTerm,
    setSearchTerm,
    handleSort,
  } = useFilesTable(files, folders);

  const {
    handleFileUpload,
    uploadingFiles,
  } = useFileUpload(folderId, session, activeProject);

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {/* Custom rendering */}
    </div>
  );
}
```

### Using Individual Components
```tsx
function CustomTable() {
  return (
    <Table>
      <FilesTableHeader 
        sortField="file_name"
        sortDirection="asc"
        onSort={handleSort}
      />
      <TableBody>
        {items.map(item => 
          item.type === 'file' ? (
            <FileRow key={item.id} resource={item} />
          ) : (
            <FolderRow key={item.id} folder={item} />
          )
        )}
      </TableBody>
    </Table>
  );
}
```

## Future Improvements

1. **Virtualization**: For large file lists
2. **Drag & Drop**: File reordering and folder movement  
3. **Context Menu**: Right-click actions
4. **Bulk Operations**: Select multiple files
5. **Memoization**: Optimize re-renders with React.memo
6. **Error Boundaries**: Graceful error handling 