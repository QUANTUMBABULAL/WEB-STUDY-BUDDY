import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_APP_BASE || '/';
  const devPort = Number(env.VITE_DEV_PORT) || 5174;
  const previewPort = Number(env.VITE_PREVIEW_PORT) || 4173;

  return {
    base,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: devPort,
    },
    preview: {
      port: previewPort,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
});
