/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';

// Load environment configurations
dotenv.config();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// 1. Mount cleanly separated Backend API routes
app.use('/api', apiRouter);

// 2. Vite dev server middleware & production static assets router
async function initServer() {
  if (process.env.VERCEL) {
    // On Vercel, static routing and ports are managed natively by the platform.
    // We only need to export the Express app with routes registered.
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    // Setup developmental Hot Module simulation server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static hosting setup
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Path to Rights App] Backend Server running on http://localhost:${PORT}`);
  });
}

initServer();

export default app;
