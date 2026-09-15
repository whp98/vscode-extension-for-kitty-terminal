# Open in Kitty Terminal (VS Code Extension)

[English](#features) | [中文](#功能特性)

A lightweight, zero-configuration VS Code extension that enables you to quickly open an independent [Kitty](https://sw.kovidgoyal.net/kitty/) terminal window at your current workspace, active file, or selected folder.

---

## Features

- **Open From Explorer Context Menu**: Right-click any file or directory in the explorer tree to open Kitty directly in that path.
- **Open From Editor**: Right-click within an editor or click the Kitty action button in the editor tab bar.
- **Global Shortcut**: Press `Ctrl+Alt+K` (`Cmd+Alt+K` on macOS) to instantly launch Kitty for the current context.
- **Command Palette**: Run `Open in Kitty` (`kitty.openTerminal`) from the command palette.
- **Customizable**: Configure custom Kitty executable path or startup arguments if needed.

## Configuration

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `kitty.executablePath` | `string` | `""` | Custom path to the Kitty executable binary. If empty, the extension looks up `kitty` in the system `PATH`. |
| `kitty.arguments` | `array` | `[]` | Additional command-line flags to pass to Kitty upon launch (e.g. `["--hold"]`). |

---

## 功能特性

- **资源管理器右键直达**：在左侧文件树中右键任意文件或目录，直接在目标目录唤起 Kitty。
- **编辑器上下文唤起**：在编辑区域右键或点击右上角标签栏图标快速打开终端。
- **快捷键支持**：默认支持 `Ctrl+Alt+K`（macOS 为 `Cmd+Alt+K`）快速打开。
- **命令面板**：`Ctrl+Shift+P` 搜索 `Open in Kitty`。
- **灵活配置**：支持自定义 Kitty 路径及启动附加参数。

## 配置项

- `kitty.executablePath`: 自定义 Kitty 路径。如果为空，默认使用系统 `PATH` 中的 `kitty`。
- `kitty.arguments`: 自定义启动附加参数数组。

## License

MIT
