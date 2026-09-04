import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedData = path.join(root, '.marketplace-data.generated.json');
const hasSupabase = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) && (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY));

if (hasSupabase) {
  const sync = spawnSync(process.execPath, [path.join(root, 'scripts/sync-marketplace-from-supabase.mjs')], { cwd: root, stdio: 'inherit', env: { ...process.env, MARKETPLACE_DATA_PATH: generatedData } });
  if (sync.status !== 0) process.exit(sync.status || 1);
}

const generate = spawnSync(process.execPath, [path.join(root, 'scripts/generate-marketplace.mjs')], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, MARKETPLACE_DATA_PATH: hasSupabase ? generatedData : path.join(root, 'marketplace-data.json') }
});
if (generate.status !== 0) process.exit(generate.status || 1);

const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const allowedRootExtensions = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.xml', '.txt']);
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && (allowedRootExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name === 'CNAME')) {
    fs.copyFileSync(path.join(root, entry.name), path.join(dist, entry.name));
  }
}
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'marketplace'), path.join(dist, 'marketplace'), { recursive: true });
console.log('Built static public website in dist/.');
