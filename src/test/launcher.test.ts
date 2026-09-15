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
