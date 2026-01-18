# Serco (Search and Copy)

**Serco** is a modern, high-performance desktop application designed to streamline the process of searching, selecting, and copying files. Originally built to assist photographers with complex file selection workflows, it offers a robust dual-pane interface that makes organizing and transferring files efficient and intuitive.

Built with [Wails](https://wails.io/), Serco combines the raw performance of a **Go** backend with the reactivity and modern UI of **Vue.js 3**.

![Serco Demo](docs/demo.gif)

## ✨ Key Features

- **Dual-Pane Interface**:
  - **Left Pane (Source)**: Navigate and select files with support for multi-selection.
  - **Right Pane (Destination)**: Easily browse and select the target folder for copying.
- **Advanced Search**:
  - **Regex Support**: Use regular expressions (e.g., `\.jpg$`) to filter files in the source pane.
  - **Multi-File Search**: Paste a list of filenames (separated by newlines) to automatically generate a multi-value search query (OR logic).
  - **Smart Filtering**: Exact match filtering for destination folders.
- **File Operations**:
  - **Batch Copying**: Securely copy multiple files with real-time progress tracking.
  - **Clipboard Integration**: Quickly copy file paths to your clipboard.
- **Modern UI/UX**:
  - **Dark Mode**: Fully supported dark theme for low-light environments.
  - **Keyboard Navigation**: Efficient history navigation (Back/Forward).
  - **Responsive Design**: Clean, utility-first styling using TailwindCSS.

## 🛠 Tech Stack

- **Backend**: Go (Golang)
- **Frontend**: Vue.js 3 (TypeScript)
- **Styling**: TailwindCSS
- **Framework**: Wails v2
- **State Management**: Pinia
- **Testing**: Vitest

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Go](https://go.dev/) (version 1.18+)
- [Node.js](https://nodejs.org/) (npm)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

To install the Wails CLI globally:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Running in Development

To start the application in development mode with hot-reloading enabled:

```bash
wails dev
```

This will compile the backend and start a local frontend development server.

### Building for Production

To create a standalone binary for your operating system:

```bash
wails build
```

The compiled application will be available in the `build/bin` directory.

## 📂 Project Structure

- **`app.go` & `main.go`**: Core Go backend logic and Wails application lifecycle.
- **`frontend/`**: Vue.js frontend source code.
  - **`src/components/`**: Reusable UI components (FileTree, SplitPane, etc.).
  - **`src/stores/`**: Pinia state management (FileSystem logic).
  - **`src/utils/`**: Helper functions (Search logic).
- **`wails.json`**: Project configuration.

## 📄 License

This project is open-source and available under the MIT License.
