import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');

const launcher = readFileSync(resolve(projectRoot, 'start-it-service-manager.bat'), 'utf8');
const guide = readFileSync(resolve(projectRoot, 'WINDOWS_LAN_SETUP.md'), 'utf8');

describe('Windows LAN launcher', () => {
  it('starts both the API and the web interface from the project directory', () => {
    expect(launcher).toContain('pnpm dev:server');
    expect(launcher).toContain('pnpm exec expo start --web --host lan --port 8081');
    expect(launcher).toContain('/D "%~dp0"');
  });

  it('documents access for Windows, Android, and iOS', () => {
    expect(guide).toContain('Windows');
    expect(guide).toContain('Android');
    expect(guide).toContain('iOS');
    expect(guide).toContain('http://IP_PC:8081');
  });
});
