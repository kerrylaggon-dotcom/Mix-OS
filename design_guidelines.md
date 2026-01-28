# Design Guidelines: Code Server Android (Phase 0)

## Brand Identity

**Purpose**: A professional development environment for Android that enables developers to run code-server, VMs, and heavy development tools on mobile devices.

**Aesthetic Direction**: **Brutally minimal + Terminal-native**
- Dark-first design (developer preference)
- Monospace typography as primary character
- Technical precision over decoration
- Maximum information density where needed
- Zero toy-like elements - this is a serious tool

**Memorable Element**: Full-screen terminal integration with native Android navigation that doesn't compromise the developer experience.

## Navigation Architecture

**Root Navigation**: Drawer (left sidebar)
- Main area: Full-screen terminal/server output
- Drawer contains: Environments, Settings, Logs, About

**Screen List**:
1. **Main Terminal** - Primary workspace showing code-server output
2. **Environments** - Manage VMs, NIX OS, QEMU instances
3. **Server Logs** - Real-time server output and diagnostics
4. **Settings** - VM configuration, auto-start preferences
5. **Setup Wizard** - First-run VM/environment initialization

## Screen-by-Screen Specifications

### 1. Main Terminal Screen
- **Purpose**: Display code-server output, VM status
- **Layout**:
  - Header: Transparent, hamburger menu (left), status indicator (right)
  - Content: Full-screen terminal output (non-scrollable, handles own scrolling)
  - Floating: Status chip showing "Server Running" or "Stopped"
- **Safe Area**: None (terminal fills entire screen, uses insets internally)

### 2. Environments Screen
- **Purpose**: Create, manage, delete development environments
- **Layout**:
  - Header: Default with "Environments" title, close button (left), add button (right)
  - Content: Scrollable list of environment cards
  - Empty state: Illustration + "No Environments" + "Tap + to create"
- **Components**: Cards showing environment name, type (NIX/QEMU/Ubuntu), status, resource usage
- **Safe Area**: Top: headerHeight + 16, Bottom: 16

### 3. Server Logs Screen
- **Purpose**: Debug and monitor server operations
- **Layout**:
  - Header: Default with "Logs" title, close button (left), clear button (right)
  - Content: Scrollable monospace log output with timestamps
- **Safe Area**: Top: headerHeight + 16, Bottom: 16

### 4. Settings Screen
- **Purpose**: Configure auto-start, VM parameters, storage
- **Layout**:
  - Header: Default with "Settings" title, close button (left)
  - Content: Scrollable form with sections (General, VM Settings, Advanced)
- **Components**: Toggle switches, dropdowns, text inputs
- **Safe Area**: Top: headerHeight + 16, Bottom: 16

### 5. Setup Wizard
- **Purpose**: First-run initialization of VM/environment
- **Layout**:
  - Header: Transparent with step indicator
  - Content: Scrollable centered content per step
  - Footer: Next/Back buttons
- **Safe Area**: Top: insets.top + 24, Bottom: insets.bottom + 24

## Color Palette

**Dark Theme (Primary)**
- Primary: `#00FF87` (terminal green, for active states)
- Background: `#0D1117` (GitHub dark bg)
- Surface: `#161B22` (raised elements)
- Surface Elevated: `#21262D` (cards, modals)
- Text Primary: `#C9D1D9` (high contrast)
- Text Secondary: `#8B949E` (muted)
- Error: `#FF6B6B`
- Warning: `#F59E0B`
- Success: `#00FF87`
- Border: `#30363D`

## Typography

**Font**: JetBrains Mono (developer-focused monospace)
**Fallback**: System monospace (Roboto Mono on Android)

**Type Scale**:
- H1: 24px Bold (screen titles)
- H2: 18px Bold (section headers)
- Body: 14px Regular (main content, logs)
- Caption: 12px Regular (metadata, timestamps)
- Terminal: 13px Regular (code output)

## Visual Design

- Icons: Material Icons (developer-standard)
- Status indicators: Colored dots (green=running, red=stopped, yellow=initializing)
- Cards: 1px border with Surface Elevated background, 8px radius
- Buttons: Outlined style for secondary, filled for primary
- Terminal output: Native Android monospace rendering, no custom styling
- Floating status chip: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

## Assets to Generate

1. **icon.png** - App icon depicting terminal window with green cursor
2. **splash-icon.png** - Same as app icon
3. **empty-environments.png** - Minimalist illustration of empty server rack (WHERE USED: Environments screen when no VMs exist)
4. **setup-welcome.png** - Abstract illustration of connected nodes/servers (WHERE USED: Setup Wizard welcome step)
5. **avatar-default.png** - Geometric developer avatar (WHERE USED: Settings/profile section)

All illustrations should use the Primary green (`#00FF87`) as accent against dark backgrounds.