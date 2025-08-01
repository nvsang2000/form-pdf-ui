import { join } from 'path';
import { serve } from 'bun';

const ROOT = process.cwd();
const PUBLIC_ROOT = join(ROOT, 'public');
const FILE_INDEX = join(PUBLIC_ROOT, 'index.html');

async function serveStaticFile(pathname: string) {
  const filePath = join(PUBLIC_ROOT, pathname);
  const file = Bun.file(filePath);

  if (await file.exists()) {
    return new Response(file);
  }
  // fallback về index.html nếu file không tồn tại
  return new Response(Bun.file(FILE_INDEX));
}

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    return await serveStaticFile(pathname);
  },
  port: process.env.PORT ?? 3000,
  development: process.env.NODE_ENV !== 'production',
});

console.log(`✅ Server is running at http://${server.hostname}:${server.port}`);
