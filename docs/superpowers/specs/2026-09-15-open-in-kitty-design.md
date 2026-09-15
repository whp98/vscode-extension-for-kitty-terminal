# Design Spec: VS Code Extension - Open in Kitty Terminal

## 1. Overview
A lightweight, zero-configuration VS Code extension that enables users to quickly open an independent Kitty terminal window at the current directory or active file directory.

## 2. Requirements & Features

### 2.1 User Actions & Entrypoints
1. **Explorer Context Menu (`explorer/context`)**:
   - Right-click a folder -> Open Kitty in that folder.
   - Right-click a file -> Open Kitty in the file's parent folder.
2. **Editor Context Menu & Title Bar (`editor/context`, `editor/title`)**:
   - Right-click inside an editor or click the Kitty icon in the editor tab/title bar -> Open Kitty in the active file's parent folder.
3. **Command Palette & Keybindings**:
   - Command: `Open in Kitty` (`kitty.openTerminal`)
   - Default Keybinding: `Ctrl+Alt+K` (Linux/Windows) / `Cmd+Alt+K` (macOS).
   - If invoked from Command Palette without active file/selection -> Fallback to the primary workspace root folder.

### 2.2 Window Behavior
- Always spawns a fresh, independent Kitty OS window using `kitty --directory <target_directory>`.
- Fully detached process (`detached: true`, `unref()`) so it runs independently of the VS Code lifecycle without blocking.

### 2.3 Configuration Settings
- `kitty.executablePath`: (string, optional, default: `""`) - Path to `kitty` binary if not in global `PATH`.
- `kitty.arguments`: (string[], optional, default: `[]`) - Extra CLI flags to pass to Kitty.

### 2.4 Error Handling
- If `kitty` executable is not found or fails to spawn, display a descriptive VS Code notification with a "Configure Path" button leading to extension settings.

## 3. Architecture & Project Layout

```
vscode-extension-for-kitty-terminal/
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── src/
│   ├── extension.ts      # Extension entrypoint, command registration
│   ├── launcher.ts       # Path resolution & child_process spawning
│   └── test/
│       └── runTest.ts
├── package.json          # Manifest, contributes (commands, menus, config, keys)
├── tsconfig.json
├── esbuild.js (or tsc compile script)
└── README.md
```

## 4. Implementation Steps
1. Initialize extension package manifest (`package.json`) with menus, commands, and configuration schemas.
2. Setup TypeScript and build configuration.
3. Implement `launcher.ts` (handling file/directory resolution and detached process spawning).
4. Register commands in `extension.ts`.
5. Test manually and verify build/packaging.
