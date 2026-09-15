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
