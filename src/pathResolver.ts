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
