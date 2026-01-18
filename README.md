# Serco (Search and Copy)

## Overview
This is a desktop application built using [Wails](https://wails.io/), which combines the power of Go for the backend and Vue.js for the frontend.

## Prerequisites
Before running the project, ensure you have the following installed:
- [Go](https://go.dev/) (version 1.18+)
- [Node.js](https://nodejs.org/) (npm)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)
- [VueJS](https://vuejs.org/)
- [TailwindCSS](https://tailwindcss.com/)

To install the Wails CLI, run:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## How to Run

### Development Mode
To run the application in development mode with hot reloading:

```bash
wails dev
```

This command will build the application and start a local development server.

### Building for Production
To build the application for production:

```bash
wails build
```

The compiled binary will be located in the `build/bin` directory.

## Project Structure
- `app.go` & `main.go`: Go backend code.
- `frontend/`: Vue.js frontend code.
- `wails.json`: Wails project configuration.
