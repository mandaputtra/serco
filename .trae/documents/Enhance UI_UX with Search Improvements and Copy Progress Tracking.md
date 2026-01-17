# Implementation Plan: Enhanced UI/UX & Copy Progress

## 1. Backend Implementation (`app.go`)
We will upgrade `CopyFiles` to support progress tracking via Wails Events.

### Progress Structure
- **Events**: We will emit `copy-progress` event from Go.
- **Data Payload**:
  ```go
  type CopyProgress struct {
      CurrentFile   string  `json:"currentFile"`
      FilesDone     int     `json:"filesDone"`
      TotalFiles    int     `json:"totalFiles"`
      Percentage    float64 `json:"percentage"`
  }
  ```

### Logic Changes
1.  **Pre-calculation**: Iterate source files first to get `TotalFiles`.
2.  **Event Emission**:
    - Emit `copy-progress` before each file copy starts.
    - Emit final `100%` event on completion.
3.  **Error Handling**: Return detailed errors if any copy fails.

## 2. Frontend State Management (`stores/fileSystem.ts`)
Update Pinia store to handle the new copy workflow.

### New State
- `isCopying`: Boolean flag to lock UI.
- `copyProgress`: Object to store current progress data.
- `showCopyConfirm`: Boolean to trigger confirmation modal.

### New Actions
- `initiateCopy()`: Opens confirmation modal.
- `confirmCopy()`:
  - Sets `isCopying = true`.
  - Subscribes to `copy-progress` event.
  - Calls backend `CopyFiles`.
  - Handles success/failure toast.
  - Unsubscribes and resets state.
- `cancelCopy()`: Closes confirmation modal.

## 3. UI Component Updates

### **`views/HomeView.vue`**
- **Search Bar**: Increase height to `h-12` (48px) and add padding.
- **Modals**:
  - **Confirmation Modal**: Shows source file count, total size (if feasible to calc on frontend easily, else just count), and destination path.
  - **Progress Overlay**: A locking modal with:
    - Spinner.
    - Progress Bar (width %).
    - Text: "Copying [Filename] (3/10)...".
    - "Processing..." message.
- **Styling**: Ensure consistent borders, shadows, and spacing (Tailwind).

### **`components/Toolbar.vue`**
- Update "Copy to Dest" button to call `store.initiateCopy()` instead of direct execution.

## 4. Execution Steps
1.  **Backend**: Modify `CopyFiles` in `app.go` to emit events.
2.  **Store**: Add progress state, event listeners, and confirmation logic in `fileSystem.ts`.
3.  **UI**:
    - Update `HomeView.vue` with new search bar styling and modal overlays.
    - Update `Toolbar.vue` action.
4.  **Verification**: Test with small and large file sets to verify progress bar smoothness and locking behavior.

## 5. Technical Details
- **Threading**: Go's `CopyFiles` runs in a separate goroutine managed by Wails, so UI won't freeze.
- **Locking**: The `isCopying` flag will be used to disable inputs/buttons via a transparent overlay or disabled states.
