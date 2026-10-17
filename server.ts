import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure HMR is disabled in AI Studio container environment to prevent WebSocket errors
process.env.DISABLE_HMR = 'true';

async function startServer() {
  const app = express();

  // Parse command-line arguments (e.g. --port 3000 --host 0.0.0.0)
  const args = process.argv.slice(2);
  let cliPort: number | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      cliPort = parseInt(args[i + 1], 10);
    }
  }

  // The application must listen on port 3000 (AI Studio standard).
  // In Google Cloud Run, process.env.PORT is 8080 (the Nginx reverse proxy front-door).
  // Nginx reverse-proxies incoming traffic from 8080 to internal port 3000.
  // Therefore, if PORT is 8080, we ignore it and bind to 3000.
  let PORT = 3000;
  if (cliPort && !isNaN(cliPort)) {
    PORT = cliPort;
  } else if (process.env.APP_PORT && !isNaN(parseInt(process.env.APP_PORT, 10))) {
    PORT = parseInt(process.env.APP_PORT, 10);
  } else if (process.env.PORT && process.env.PORT !== '8080' && !isNaN(parseInt(process.env.PORT, 10))) {
    PORT = parseInt(process.env.PORT, 10);
  }

  // CORS support for web, mobile PWA, and native Capacitor Android WebViews
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // JSON and URL-encoded body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Development: Mount Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: Serve static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlobalWeb Studio Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Waiting or stopping previous server instance.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
