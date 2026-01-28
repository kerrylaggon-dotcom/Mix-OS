# Code Server Terminal

## Overview
A sandboxed Android application for running code-server (VS Code in browser), powered by NixOS and QEMU. This is Phase 0 of an AI development environment project.

**Current State**: Phase 0 - UI foundation with swipe navigation
**Version**: 0.1.0

## Project Architecture

### Frontend (Expo React Native)
- **Navigation**: Bottom tabs + Stack navigation with swipe-based workspace
- **State Management**: React Context (ServerContext) with AsyncStorage persistence
- **Styling**: Dark terminal theme with JetBrains Mono font

### Screens
1. **WorkspaceScreen** - Main workspace with swipeable Terminal and Code Editor views
2. **EnvironmentsScreen** - Manage VMs, NixOS, QEMU instances
3. **LogsScreen** - Real-time server logs with timestamps
4. **SettingsScreen** - Configuration for auto-start, VM settings
5. **DownloadManagerScreen** - Download code-server, NixOS, QEMU components
6. **SetupWizardScreen** - First-run initialization wizard

### Key Components
- `TerminalView` - Interactive terminal with command support
- `CodeServerView` - WebView-based code editor connection
- `StatusIndicator` - Animated status dots for server/environment state
- `ServerContext` - Global state for server, environments, logs, settings, downloads

### Component Downloads
- code-server (~85MB) - VS Code in browser
- Nix Package Manager (~120MB) - Reproducible builds
- QEMU (~200MB) - Full system emulation
- BusyBox (~2MB) - Unix utilities
- Alpine Linux rootfs (~50MB) - Lightweight Linux

### Backend (Express.js)
- Port: 5000
- Currently minimal - ready for Phase 1 implementation

## Development Setup

### Running the App
1. Start Backend: `npm run server:dev`
2. Start Frontend: `npm run expo:dev`

### Key Files
- `client/App.tsx` - App entry with providers
- `client/context/ServerContext.tsx` - Global state management
- `client/navigation/RootNavigator.tsx` - Stack navigation
- `client/navigation/MainTabNavigator.tsx` - Bottom tab navigation
- `client/screens/WorkspaceScreen.tsx` - Swipeable workspace
- `client/components/TerminalView.tsx` - Interactive terminal
- `client/components/CodeServerView.tsx` - WebView code editor
- `client/constants/theme.ts` - Dark terminal theme colors

## Phase Roadmap

### Phase 0 (Current) - UI Foundation
- [x] Bottom tab navigation
- [x] Swipeable workspace (Terminal <-> Code Editor)
- [x] Interactive terminal with commands
- [x] Environment management UI
- [x] Download manager for components
- [x] Settings and configuration screens
- [x] Setup wizard for first run
- [x] Dark terminal theme

### Phase 1 (Complete) - Backend Integration & Deep Architecture
- [x] Real file system downloads (axios, streaming)
- [x] WebSocket for real-time logs (ws server)
- [x] Code-server process management (spawn, lifecycle)
- [x] Environment creation/deletion backend (storage, CRUD)
- [x] QEMU VM spawning with kernel/rootfs/initramfs
- [x] WASM sandbox execution (WebAssembly native API)
- [x] Prebuild script for asset preparation
- [x] Testing infrastructure (Jest + supertest)
- [x] Structured logging (Winston)
- [x] Security (rate limiting, input validation)
- [x] Error handling & resilience

### Phase 2 (Current) - Native Integration & Build
- [ ] EAS Build configuration (eas.json)
- [ ] GitHub Actions workflow for APK build
- [ ] Native terminal emulation (Xterm.js integration)
- [ ] Android native module setup
- [ ] Backend native bridge communication
- [ ] NixOS/QEMU integration verification
- [ ] APK signing & release configuration
- [ ] Testing on real devices
- [ ] Production deployment pipeline

## User Preferences
- Dark theme only (developer preference)
- Monospace typography (JetBrains Mono)
- Terminal-native aesthetic
- No emojis in UI
- Swipe gestures for navigation

## Terminal Commands
- `help` - Show available commands
- `status` - Show server status
- `start` - Start code-server
- `stop` - Stop code-server
- `download` - List downloadable components
- `download <id>` - Download a specific component
- `ls` - List files
- `clear` - Clear terminal
- `version` - Show version info

## Recent Changes
- 2026-01-28: Completed Phase 1 (Backend Integration & Deep Architecture)
  - Implemented QEMU VM management with environment persistence
  - WASM sandbox execution with WebAssembly native API
  - Prebuild script for component extraction
  - Jest testing + Winston logging + Rate limiting
  - Now starting Phase 2 (Native Integration & Build)
