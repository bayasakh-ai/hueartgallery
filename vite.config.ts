import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  The CMS (public/admin) saves one JSON file per item in content/:
    content/paintings/*.json, content/artists/*.json, content/exhibitions/*.json,
    content/site.json
  Each file holds { "en": {...}, "mn": {...} }. This plugin combines them into
  the files the site loads: /data/paintings.json, /data/painters.json,
  /data/events.json, /data/site.json (served live in dev, written on build).
*/
const CONTENT = fileURLToPath(new URL('./content', import.meta.url));
const LISTS: Record<string, { folder: string; key: string }> = {
  'paintings.json': { folder: 'paintings', key: 'paintings' },
  'painters.json': { folder: 'artists', key: 'painters' },
  'events.json': { folder: 'exhibitions', key: 'events' },
};

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function buildData(name: string): string | null {
  if (name === 'site.json') {
    const file = join(CONTENT, 'site.json');
    return existsSync(file) ? JSON.stringify(readJson(file)) : null;
  }
  const list = LISTS[name];
  if (!list) return null;
  const dir = join(CONTENT, list.folder);
  const items = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => ({ id: f.slice(0, -5).normalize('NFC'), ...(readJson(join(dir, f)) as object) }))
    : [];
  return JSON.stringify({ [list.key]: items });
}

function contentData(): Plugin {
  return {
    name: 'content-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/data\/([\w-]+\.json)(\?|$)/);
        const body = m && buildData(m[1]);
        if (!body) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(body);
      });
    },
    generateBundle() {
      for (const name of ['site.json', ...Object.keys(LISTS)]) {
        const source = buildData(name);
        if (source) this.emitFile({ type: 'asset', fileName: `data/${name}`, source });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), contentData()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
