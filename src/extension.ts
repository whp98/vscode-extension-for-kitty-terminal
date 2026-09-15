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
