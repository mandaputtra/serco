# Implementation Plan: Dual-Pane File Explorer

## 1. Backend Implementation (`app.go`)
We will extend the `App` struct to support file operations.
- **`CopyFiles(srcs []string, destDir string) error`**: Iterates through source paths and copies them to the destination directory using `io.Copy`. It will verify the destination exists.
- **`ScanDirectory` Update**: Ensure it returns all files (we will filter hidden files in the frontend for speed).

## 2. Frontend State Management (`stores/fileSystem.ts`)
Update the Pinia store to manage the complex dual-pane state:
- **State**:
  - `activePane`: 'left' | 'right'
  - `leftPanePath`: Current path for left pane.
  - `rightPanePath`: Current path for right pane.
  - `showHiddenFiles`: Boolean toggle.
  - `selectedLeft`: Set of selected paths in left pane.
  - `selectedRight`: Selected path in right pane (single).
  - `clipboardStatus`: For toast notifications.
- **Actions**:
  - `setActivePane(pane)`
  - `toggleHiddenFiles()`
  - `copyToClipboard()`: Uses Wails runtime.
  - `executeTransfer()`: Calls backend `CopyFiles`.

## 3. UI Component Architecture

### **`components/SplitPane.vue` (New)**
- A layout component handling the resizable divider logic.
- Slots for `left` and `right` content.

### **`components/FileTree.vue` (Refactor)**
- Add props:
  - `paneId`: 'left' | 'right'
  - `allowMultiSelect`: Boolean
  - `foldersOnly`: Boolean (for right pane)
- Update logic to respect `showHiddenFiles` store state.
- Highlight active pane on click.

### **`components/Toolbar.vue` (New)**
- **Buttons**:
  - "Copy to Clipboard" (Left pane selection)
  - "Show Selection" (Modal trigger)
  - "Copy to Destination" (Triggers transfer)
  - "Show/Hide Hidden" (Toggle)

### **`views/HomeView.vue` (Refactor)**
- **Header**: Contains the unified Search Bar.
- **Body**: Uses `SplitPane` containing two `FileTree` instances.
- **Footer/Overlays**: Toast notifications and Selection Modal.

## 4. Search & Features
- **Unified Search**:
  - In `SearchBar.vue`, watch input.
  - If `activePane === 'left'`, filter files (regex/case-insensitive).
  - If `activePane === 'right'`, filter folders (exact/case-sensitive).
- **Clipboard**: Use `wailsjs/runtime` to set text.
- **Hidden Files**: CSS class to style them (opacity: 0.5, italic) or `v-if` to hide them based on store state.

## 5. Execution Steps
1.  **Backend**: Add `CopyFiles` to `app.go`.
2.  **Store**: Update `fileSystem.ts` with new state and actions.
3.  **Components**: Create `SplitPane`, `Toolbar`, and refactor `FileTree`.
4.  **Integration**: Assemble in `HomeView`.
5.  **Styling**: Apply Tailwind classes for borders, active states, and responsive layout.

## 6. Verification
- Test file copying between panes.
- Verify search context switching.
- Check responsiveness on resizing.
