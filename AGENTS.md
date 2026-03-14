# Serco - AI Agent Guide

## Project Overview

**Serco** (Search and Copy) is a modern desktop file management application built with [Wails v2](https://wails.io/). It provides a dual-pane interface for efficiently searching, selecting, and copying files. Originally designed for photographers with complex file selection workflows.

- **Repository Language**: English (with some Chinese comments in Go code)
- **License**: MIT License (Copyright 2024 Manda Putra)
- **Author**: Manda Putra <mandaputra8@gmail.com>

## Technology Stack

### Backend
- **Language**: Go 1.22+
- **Framework**: Wails v2 (v2.11.0)
- **Key Dependencies**:
  - `github.com/wailsapp/wails/v2` - Cross-platform desktop app framework
  - `github.com/labstack/echo/v4` - Web framework (used internally by Wails)

### Frontend
- **Framework**: Vue.js 3 with TypeScript
- **Build Tool**: Vite 3.x
- **State Management**: Pinia 2.x
- **Routing**: Vue Router 4.x
- **Internationalization**: Vue i18n 9.x
- **Styling**: TailwindCSS 3.x with Dark Mode support
- **Testing**: Vitest 4.x

## Project Structure

```
.
├── app.go                 # Core Go backend logic (file operations)
├── app_test.go            # Go unit tests
├── main.go                # Wails application entry point
├── go.mod                 # Go module definition
├── go.sum                 # Go dependency checksums
├── wails.json             # Wails project configuration
├── build/                 # Build assets
│   ├── appicon.png        # Application icon
│   ├── bin/               # Compiled binaries (gitignored)
│   ├── darwin/            # macOS specific files
│   └── windows/           # Windows specific files
├── frontend/              # Vue.js frontend source
│   ├── src/
│   │   ├── App.vue        # Root component
│   │   ├── main.ts        # Frontend entry point
│   │   ├── style.scss     # Global styles
│   │   ├── components/    # Vue components
│   │   │   ├── Breadcrumbs.vue
│   │   │   ├── FileNode.vue
│   │   │   ├── FileTree.vue      # File tree display
│   │   │   ├── HelloWorld.vue
│   │   │   ├── SplitPane.vue     # Dual-pane layout
│   │   │   └── ToolBar.vue
│   │   ├── stores/        # Pinia stores
│   │   │   └── fileSystem.ts     # Main file system state
│   │   ├── views/         # Page components
│   │   │   ├── HomeView.vue      # Main dual-pane interface
│   │   │   └── AboutView.vue
│   │   ├── router/        # Vue Router config
│   │   ├── i18n/          # Internationalization
│   │   │   └── locales/
│   │   │       ├── en.json       # English
│   │   │       ├── id.json       # Indonesian
│   │   │       └── zh-Hans.json  # Chinese Simplified
│   │   ├── utils/         # Utility functions
│   │   │   ├── search.ts
│   │   │   └── __tests__/ # Vitest tests
│   │   └── assets/        # Static assets
│   ├── package.json       # npm dependencies
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.cjs # TailwindCSS configuration
│   └── wailsjs/           # Wails generated Go bindings
├── docs/                  # Documentation assets
│   └── demo.gif           # Demo animation
└── LICENSE                # MIT License
```

## Build and Development Commands

### Prerequisites
- Go 1.22 or later
- Node.js with npm
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Development
```bash
# Start development server with hot-reload
wails dev
```
This will:
1. Compile the Go backend
2. Start the Vite dev server for frontend
3. Watch for changes and auto-reload

### Production Build
```bash
# Build standalone binary for current OS
wails build

# Build for specific platforms
wails build -platform darwin/universal  # macOS
wails build -platform windows/amd64     # Windows
wails build -platform linux/amd64       # Linux
```

Output will be in `build/bin/` directory.

### Frontend-only Commands (run from `frontend/` directory)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build frontend only
npm run build

# Type check with Vue TypeScript
npm run type-check

# Run linter
npm run lint

# Run tests
npx vitest
```

### Go Commands
```bash
# Run Go tests
go test -v

# Build Go only
go build
```

## Architecture Details

### Backend (Go)

The Go backend exposes methods to the frontend via Wails binding:

**Key Types** (in `app.go`):
```go
type FileNode struct {
    Name     string      `json:"name"`
    Path     string      `json:"path"`
    IsDir    bool        `json:"isDir"`
    Size     int64       `json:"size"`
    ModTime  string      `json:"modTime"`
    Children []*FileNode `json:"children,omitempty"`
}

type CopyProgress struct {
    CurrentFile string  `json:"currentFile"`
    FilesDone   int     `json:"filesDone"`
    TotalFiles  int     `json:"totalFiles"`
    Percentage  float64 `json:"percentage"`
}
```

**Exposed Methods**:
- `GetHomeDir()` - Get user's home directory
- `ScanDirectory(path string)` - Scan directory and return file tree
- `CopyFiles(srcPaths []string, destDir string)` - Copy files with progress events

**Lifecycle Hooks**:
- `startup()` - Called at app startup
- `domReady()` - Called when frontend DOM is loaded
- `beforeClose()` - Called before app closes
- `shutdown()` - Called at app termination

### Frontend (Vue.js)

**State Management** (`stores/fileSystem.ts`):
- Dual-pane file system state (left/source, right/destination)
- Navigation history for each pane
- File selection management
- Copy operation state with progress tracking
- Dark mode preference (persisted to localStorage)

**Key Features**:
1. **Dual-Pane Interface**: Resizable split pane with independent navigation
2. **Advanced Search**:
   - Left pane: Regex-based file search, multi-file search (comma-separated)
   - Right pane: Exact match folder search
   - Paste support for multi-line filename lists
3. **File Operations**: Batch copy with progress tracking
4. **Theme Support**: Dark/Light mode toggle

**Wails Runtime API Usage**:
```typescript
// Go method binding
import { GetHomeDir, ScanDirectory, CopyFiles } from '../../wailsjs/go/main/App'

// Runtime features
import { ClipboardSetText, EventsOn, EventsOff } from '../../wailsjs/runtime'
```

## Code Style Guidelines

### Go
- Follow standard Go conventions (`gofmt`)
- Comments in both English and Chinese (mixed)
- Use `runtime.LogDebugf()` / `runtime.LogErrorf()` for logging

### TypeScript/Vue
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: No trailing semicolons
- **TypeScript**: Strict mode enabled
- **Components**: Composition API with `<script setup lang="ts">`
- **Styling**: TailwindCSS utility classes, dark mode variants with `dark:` prefix

### ESLint/Prettier Configuration
Located in `frontend/.eslintrc.cjs` and `frontend/.prettierrc.json`:
- Uses `@vue/eslint-config-typescript`
- Prettier integration with eslint
- Google ESLint config for base rules

## Testing Strategy

### Backend Tests (`app_test.go`)
```bash
go test -v
```
- Tests file copy operations
- Tests directory copy functionality
- Uses temporary directories for isolation

### Frontend Tests
```bash
cd frontend && npx vitest
```
- Located in `frontend/src/utils/__tests__/`
- Uses Vitest for unit testing
- Vue Test Utils for component testing

## Internationalization (i18n)

Supported languages:
- English (`en.json`)
- Indonesian (`id.json`)
- Chinese Simplified (`zh-Hans.json`)

Usage in components:
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  {{ t('nav.home') }}
</template>
```

## Git Ignore Patterns

Key patterns from `.gitignore`:
- Go: `*.exe`, `*.test`, `*.out`, `go.work`
- Node: `node_modules/`, `dist/`, `.env`
- Build: `/build/bin` (compiled binaries)
- IDE: `.vscode/`, `.idea/`
- OS: `.DS_Store`

## Security Considerations

1. **File Operations**: The app has full file system access - be careful with path validation
2. **Symlinks**: `ScanDirectory` handles symlinks using `os.Lstat()` to avoid following them automatically
3. **Copy Operations**: Preserves file permissions and modification times
4. **No Sandbox**: This is a desktop app with native file system access

## Common Development Tasks

### Adding a New Go Method
1. Add method to `App` struct in `app.go`
2. Wails will auto-generate bindings in `frontend/wailsjs/`
3. Import and use in frontend via `wailsjs/go/main/App`

### Adding a Frontend Component
1. Create `.vue` file in `frontend/src/components/`
2. Use `<script setup lang="ts">` for Composition API
3. Use Tailwind classes for styling
4. Add dark mode variants: `class="bg-white dark:bg-gray-800"`

### Adding i18n Strings
1. Add to all locale files in `frontend/src/i18n/locales/`
2. Use nested keys for organization
3. Access via `t('key.subkey')`

## Troubleshooting

### Common Issues
1. **Wails not found**: Install with `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
2. **Frontend build fails**: Run `npm install` in `frontend/` directory
3. **Type errors**: Run `npm run type-check` in `frontend/` to diagnose

### Platform-Specific Notes
- **macOS**: Uses `mac.NSAppearanceNameDarkAqua` for dark mode
- **Windows**: WebView2 runtime required
- **Linux**: GTK3 dependency required

## Resources

- [Wails Documentation](https://wails.io/docs/)
- [Vue.js 3 Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
