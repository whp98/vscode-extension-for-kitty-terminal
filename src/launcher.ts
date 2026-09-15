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
