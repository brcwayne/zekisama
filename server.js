const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8080', 10);
const ROOT_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, 'data');
const STATE_FILE = path.join(DATA_DIR, 'zek-state.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  if (pathname === '/api/state' || pathname.endsWith('/api/state')) {
    ensureDataDir();
    if (req.method === 'GET') {
      if (!fs.existsSync(STATE_FILE)) {
        return sendJson(res, 200, {});
      }
      try {
        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        return sendJson(res, 200, JSON.parse(raw));
      } catch {
        return sendJson(res, 200, {});
      }
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) {
          req.destroy();
        }
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          fs.writeFileSync(STATE_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          return sendJson(res, 200, { ok: true });
        } catch {
          return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
        }
      });
      return;
    }

    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  // Static File Serving
  let relPath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.replace(/^\/+/, ''));
  const resolved = path.resolve(ROOT_DIR, relPath);
  if (!resolved.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Prevent exposing server files or data directory
  const baseName = path.basename(resolved);
  if (
    resolved.startsWith(DATA_DIR) ||
    baseName === 'server.js' ||
    baseName === 'Dockerfile' ||
    baseName === 'docker-compose.yml'
  ) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  fs.stat(resolved, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    fs.createReadStream(resolved).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ZeK Gorev Kavanozu sunucusu http://0.0.0.0:${PORT} adresinde calisiyor.`);
});
