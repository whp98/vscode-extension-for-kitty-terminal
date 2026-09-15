# Open in Kitty Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight VS Code extension that allows opening an independent Kitty terminal window at the selected directory or active file directory via menus, shortcut, and command palette.

**Architecture:** Pure TypeScript extension using VS Code Extension API. It inspects command invocation context (URI from explorer/editor or fallback to active editor/workspace folder), resolves target folder path, and spawns Kitty as an independent detached process using Node.js `child_process.spawn`.

**Tech Stack:** TypeScript, VS Code Extension API (`vscode`), Node.js built-ins (`child_process`, `fs`, `path`), Mocha & Vitest/Node test runner for unit testing.

---

### Task 1: Initialize Project Structure & Manifest

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.vscodeignore`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
node_modules/
out/
dist/
*.vsix
.DS_Store
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "outDir": "out",
    "lib": ["ES2022"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  },
  "exclude": ["node_modules", ".vscode-test"]
}
```

- [ ] **Step 3: Create `package.json` with commands, menus, configuration, and build scripts**

```json
{
  "name": "vscode-kitty-terminal",
  "displayName": "Open in Kitty Terminal",
  "description": "Open an independent Kitty terminal window at current file or directory in VS Code",
  "version": "0.1.0",
  "publisher": "local",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "main": "./out/extension.js",
  "activationEvents": [],
  "contributes": {
    "commands": [
      {
        "command": "kitty.openTerminal",
        "title": "Open in Kitty",
        "category": "Terminal"
      }
    ],
    "keybindings": [
      {
        "command": "kitty.openTerminal",
        "key": "ctrl+alt+k",
        "mac": "cmd+alt+k"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "kitty.openTerminal",
          "group": "navigation@100"
        }
      ],
      "editor/context": [
        {
          "command": "kitty.openTerminal",
          "group": "navigation@100"
        }
      ],
      "editor/title": [
        {
          "command": "kitty.openTerminal",
          "group": "navigation"
        }
      ]
    },
    "configuration": {
      "title": "Kitty Terminal",
      "properties": {
        "kitty.executablePath": {
          "type": "string",
          "default": "",
          "description": "Custom path to the Kitty executable. If empty, the system PATH will be used."
        },
        "kitty.arguments": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "default": [],
          "description": "Additional command line arguments to pass when launching Kitty."
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "node --test out/test/**/*.test.js"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.80.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 4: Create `.vscodeignore`**

```text
.vscode/**
src/**
docs/**
tsconfig.json
.gitignore
```

- [ ] **Step 5: Install dependencies and verify compilation environment**

Run: `npm install`
Expected: Dependencies installed without errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .gitignore .vscodeignore package-lock.json
git commit -m "chore: initialize project configuration and manifest"
```

---

### Task 2: Implement Path & Context Resolver with Tests

**Files:**
- Create: `src/pathResolver.ts`
- Create: `src/test/pathResolver.test.ts`

- [ ] **Step 1: Write unit tests for `resolveTargetDirectory`**

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { resolveTargetDirectory } from '../pathResolver';

test('resolveTargetDirectory returns folder path if input is a directory', () => {
  const tmpDir = os.tmpdir();
  const resolved = resolveTargetDirectory({ fsPath: tmpDir });
  assert.strictEqual(resolved, tmpDir);
});

test('resolveTargetDirectory returns parent directory if input is a file', () => {
  const tmpFile = path.join(os.tmpdir(), 'test_file_kitty.txt');
  fs.writeFileSync(tmpFile, 'test');
  try {
    const resolved = resolveTargetDirectory({ fsPath: tmpFile });
    assert.strictEqual(resolved, os.tmpdir());
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

test('resolveTargetDirectory returns undefined if no target uri or editor is provided', () => {
  const resolved = resolveTargetDirectory(undefined, undefined, undefined);
  assert.strictEqual(resolved, undefined);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run compile && npm test`
Expected: FAIL with Cannot find module `../pathResolver`.

- [ ] **Step 3: Implement `src/pathResolver.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface UriLike {
  fsPath: string;
}

export function resolveTargetDirectory(
  targetUri?: UriLike,
  activeEditorUri?: UriLike,
  workspaceRoot?: UriLike
): string | undefined {
  const candidate = targetUri?.fsPath || activeEditorUri?.fsPath;

  if (candidate) {
    try {
      if (fs.existsSync(candidate)) {
        const stat = fs.statSync(candidate);
        return stat.isDirectory() ? candidate : path.dirname(candidate);
      }
    } catch {
      // Fallback if stat fails
      return path.dirname(candidate);
    }
  }

  if (workspaceRoot?.fsPath) {
    return workspaceRoot.fsPath;
  }

  return undefined;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run compile && npm test`
Expected: PASS (all tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/pathResolver.ts src/test/pathResolver.test.ts
git commit -m "feat: implement target directory resolution with unit tests"
```

---

### Task 3: Implement Kitty Launcher Process Handler

**Files:**
- Create: `src/launcher.ts`
- Create: `src/test/launcher.test.ts`

- [ ] **Step 1: Write unit tests for argument preparation and launcher options**

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';
import { buildKittySpawnArgs } from '../launcher';

test('buildKittySpawnArgs constructs correct command arguments', () => {
  const dir = '/home/user/project';
  const args = buildKittySpawnArgs(dir, ['--hold']);
  assert.deepStrictEqual(args, ['--directory', dir, '--hold']);
});

test('buildKittySpawnArgs handles empty custom args', () => {
  const dir = '/home/user/project';
  const args = buildKittySpawnArgs(dir);
  assert.deepStrictEqual(args, ['--directory', dir]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run compile && npm test`
Expected: FAIL with Cannot find module `../launcher`.

- [ ] **Step 3: Implement `src/launcher.ts`**

```typescript
import { spawn, ChildProcess } from 'node:child_process';

export interface LaunchKittyOptions {
  executablePath?: string;
  targetDirectory: string;
  customArgs?: string[];
}

export function buildKittySpawnArgs(targetDirectory: string, customArgs: string[] = []): string[] {
  return ['--directory', targetDirectory, ...customArgs];
}

export function launchKitty(options: LaunchKittyOptions): ChildProcess {
  const command = options.executablePath && options.executablePath.trim().length > 0
    ? options.executablePath.trim()
    : 'kitty';

  const args = buildKittySpawnArgs(options.targetDirectory, options.customArgs);

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();
  return child;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run compile && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/launcher.ts src/test/launcher.test.ts
git commit -m "feat: implement kitty launcher process runner with unit tests"
```

---

### Task 4: Connect VS Code Commands & Extension Lifecycle

**Files:**
- Create: `src/extension.ts`

- [ ] **Step 1: Implement `src/extension.ts`**

```typescript
import * as vscode from 'vscode';
import { resolveTargetDirectory } from './pathResolver';
import { launchKitty } from './launcher';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'kitty.openTerminal',
    async (uri?: vscode.Uri) => {
      const config = vscode.workspace.getConfiguration('kitty');
      const executablePath = config.get<string>('executablePath', '');
      const customArgs = config.get<string[]>('arguments', []);

      const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri;

      const targetDirectory = resolveTargetDirectory(uri, activeEditorUri, workspaceRoot);

      if (!targetDirectory) {
        vscode.window.showWarningMessage('Kitty Terminal: Unable to determine a directory to open.');
        return;
      }

      try {
        const child = launchKitty({
          executablePath,
          targetDirectory,
          customArgs
        });

        child.on('error', (err: any) => {
          if (err.code === 'ENOENT') {
            vscode.window
              .showErrorMessage(
                `Kitty executable not found: "${executablePath || 'kitty'}". Please ensure Kitty is installed and added to PATH or configure the path in settings.`,
                'Open Settings'
              )
              .then((selection) => {
                if (selection === 'Open Settings') {
                  vscode.commands.executeCommand(
                    'workbench.action.openSettings',
                    'kitty.executablePath'
                  );
                }
              });
          } else {
            vscode.window.showErrorMessage(`Failed to open Kitty: ${err.message}`);
          }
        });
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to launch Kitty: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
```

- [ ] **Step 2: Compile extension and run all tests**

Run: `npm run compile && npm test`
Expected: PASS without compile or test errors.

- [ ] **Step 3: Commit**

```bash
git add src/extension.ts
git commit -m "feat: wire up command registration and error handling in extension"
```

---

### Task 5: Add Documentation & README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**
Document features, shortcuts, configuration options, and installation/usage instructions in English and Chinese.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage instructions and configuration details"
```
