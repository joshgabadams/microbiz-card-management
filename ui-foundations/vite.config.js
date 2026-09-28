import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readEnvironment } from './src/config/environment.js';

export default defineConfig(({ command, mode }) => {
  // Reject invalid public settings before producing or serving an application.
  readEnvironment({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env, DEV: command !== 'build' });
  return {
    plugins: [react(), {
      name: 'bundle-loading-reference',
      apply: 'build',
      enforce: 'pre',
      transform(code, id) {
        // Import this one reviewed asset through CSS so Vite fingerprints it.
        // The remaining reference sheets are not application assets.
        if (id.endsWith('/src/styles/global.css')) return code.replace("url('/assets/loading-animation.png')", "url('../../public/assets/loading-animation.png')");
      },
    }],
    publicDir: command === 'build' ? false : 'public',
  };
});
