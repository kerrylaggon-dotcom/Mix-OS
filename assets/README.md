# Mix-OS Assets

This directory contains assets for the Mix-OS application.

## Structure

- `images/` - App icons, splash screens, and UI images
- `fonts/` - Custom fonts (JetBrains Mono loaded via expo-google-fonts)

## VM Assets (Downloaded at Runtime)

The following assets are NOT bundled with the APK to keep size manageable:
- QEMU binary (pre-compiled for ARM64)
- Linux kernel
- Alpine/NixOS rootfs
- code-server binary

These will be downloaded on first run or managed via the Download Manager.
