import { execSync } from 'child_process';
import fs from 'fs';

try {
  const out = execSync('node server.js', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('success.log', out);
} catch (e) {
  fs.writeFileSync('error.log', e.stderr || e.message);
}
