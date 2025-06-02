# DocumentSelector Refactoring

This directory contains the refactored DocumentSelector components that follow the same clean, modular structure as the FilesTable components. The refactoring maximizes code reuse and creates a uniform system.

## File Structure

```
src/components/DocumentSelector/
├── README.md                      # This documentation
├── index.tsx                      # Main exports
├── types.ts                       # TypeScript type definitions
├── DocumentSelector.tsx           # Main component (refactored)
├── DocumentSelectorHeader.tsx     # Header with navigation and actions
├── SelectedItemsList.tsx          # Selected items display
└── useDocumentSelector.ts         # Hook for selection logic
```

## Reused Components

The DocumentSelector leverages existing FilesTable components:

- **FileRow** as `DocumentFileRow`
- **FolderRow** as `DocumentFolderRow`
- **FileUploadButton** as `DocumentUploadButton`
- **FileUploadProgress** as `DocumentUploadProgress`
- **EmptyFilesDisplay** as `EmptyDocumentsDisplay`
- **AddFolderButton** as `DocumentAddFolderButton`
- **useFileUpload** as `useDocumentUpload`

## New Components

### `DocumentSelector`
The main component that orchestrates all functionality. Provides the same API as the original but with clean internal structure.

### `DocumentSelectorHeader`
Handles navigation, breadcrumbs, and action buttons (upload, create folder, set context, scope selection).

### `SelectedItemsList`
Manages the display of selected items with remove functionality.

### `useDocumentSelector`
Hook that abstracts selection logic, filtering, sorting, and pagination.

## Usage

### Basic Usage
```tsx
import DocumentSelector from "@/components/ProjectEvent/DocumentSelector";

<DocumentSelector
  selectedItems={selectedItems}
  setSelectedItems={setSelectedItems}
  folderSelectOnly={false}
  useChatContext={false}
/>
```

### Chat Context Mode
```tsx
<DocumentSelector useChatContext={true} />
```

### Folder Selection Only
```tsx
<DocumentSelector folderSelectOnly={true} />
```

## Benefits

1. **Code Reuse**: Maximum reuse of existing FilesTable components
2. **Consistency**: Same UI/UX patterns across file management
3. **Maintainability**: Clear separation of concerns
4. **Type Safety**: Comprehensive TypeScript interfaces
5. **Backward Compatibility**: Existing usage continues to work
6. **Performance**: Optimized re-renders and caching

## Migration

The original `DocumentSelector.tsx` now acts as a wrapper that converts legacy props to the new format, ensuring all existing usage continues to work without changes.

## Future Enhancements

- Search functionality integration
- Sorting and filtering options
- Bulk selection operations
- Drag and drop support
- Virtualization for large lists 