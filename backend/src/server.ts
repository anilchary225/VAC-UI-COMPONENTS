import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  const app = createApp();

  // Connect to DB asynchronously (safe failure handling)
  connectDatabase()
    .then((connected) => {
      if (connected) {
        import('./modules/components/components.seed.service')
          .then(({ ensureInitialComponentsSeeded }) => ensureInitialComponentsSeeded())
          .catch((err) => console.warn('Seeding check failed:', err));
      }
    })
    .catch((err) => {
      console.error('Initial database connection failure:', err);
    });

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 VAC-UI-COMPONENTS API Server listening on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`👉 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`👉 Components API: http://localhost:${env.PORT}/api/components`);
  });

  const gracefulShutdown = () => {
    console.log('Received shutdown signal, terminating server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
