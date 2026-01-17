# Project Name

For now the project name is file-search-and-copy. A way to find files on user directory and copy them to another directory.     

## Project Requirements

- Go 1.24.12
- NodeJS 24    

## Project Frameworks

- Vue 3, frontend frameworks
- Wails, golang desktop app framework
- Pinia.js, state management for Vue 3

## Project Structure

- /main.go - The main application
- /frontend/ - Frontend project files
- /build/ - Project build directory
- /build/appicon.png - The application icon
- /build/darwin/ - Mac specific project files
- /build/windows/ - Windows specific project files
- /wails.json - The project configuration
- /go.mod - Go module file
- /go.sum - Go module checksum file
- /docs - project documents, contains project requirements

## Project Command

- `wails dev` run development server
- `wails build` run build