// Dev-only Vite plugin: mounts the Vercel-style /api/tutor handler on the
// dev server so `npm run dev` is enough — no `vercel dev` required.
//
// The handler in api/tutor.ts uses the web-standard Request/Response API
// (Node 20+ provides both as globals), so we just bridge the Connect-style
// req/res Vite gives us into a Web Request, call the handler, then stream
// the Web Response back out.
//
// `apply: 'serve'` ensures this plugin only runs for `vite` (dev / preview),
// never during `vite build`. The api/ folder is what ships to Vercel for
// real in production.

import { loadEnv, type Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Resolves /api/<name>(?...|/...) → the handler module path. Returns null if
// the URL doesn't look like an /api/ request.
function resolveHandlerPath(reqUrl: string): string | null {
  if (!reqUrl.startsWith('/api/')) return null;
  // Strip query string and trailing path segments — only the endpoint name
  // matters (`/api/tutor`, `/api/explain`, etc.).
  const name = reqUrl.slice('/api/'.length).split(/[/?]/)[0];
  if (!name) return null;
  return `/api/${name}`;
}

export function apiDevPlugin(): Plugin {
  return {
    name: 'englishly:api-dev',
    apply: 'serve',
    configureServer(server) {
      // Mirror Vercel's behaviour: read .env / .env.local into process.env
      // so handlers can `process.env.DEEPSEEK_API_KEY` exactly as in prod.
      const env = loadEnv('development', process.cwd(), '');
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] == null) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const handlerPath = resolveHandlerPath(req.url);
        if (!handlerPath) return next();
        try {
          const webReq = await toWebRequest(req);
          // Dynamic import so each request re-evaluates the handler — edits
          // to api/*.ts take effect without restarting the dev server.
          const mod = await server.ssrLoadModule(handlerPath);
          const handler = mod.default as (r: Request) => Promise<Response>;
          const webRes = await handler(webReq);
          await writeWebResponse(webRes, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Dev middleware error: ${(err as Error).message}` }));
        }
      });
    },
  };
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'http';
  const host = (req.headers.host as string | undefined) ?? 'localhost';
  const url = new URL(req.url ?? '/', `${proto}://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue;
    if (Array.isArray(v)) for (const item of v) headers.append(k, item);
    else headers.set(k, v);
  }

  const method = req.method ?? 'GET';
  const init: RequestInit = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    // Pass the body as a string. The handler calls `req.json()` so utf-8
    // decoding here is equivalent to what Fetch would do internally, and we
    // sidestep TS lib.dom's narrow BodyInit definition for typed arrays.
    init.body = (await readBody(req)).toString('utf-8');
  }
  return new Request(url.toString(), init);
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function writeWebResponse(webRes: Response, res: ServerResponse): Promise<void> {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  const buf = Buffer.from(await webRes.arrayBuffer());
  res.end(buf);
}
