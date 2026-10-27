import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // `@/…` → `src/…` (declared in tsconfig "paths"); used by the design system examples.
  resolve: { tsconfigPaths: true },
  build: {
    rolldownOptions: {
      // Two pages: the cause card at / and the design system docs at /design-system/.
      input: {
        main: 'index.html',
        designSystem: 'design-system/index.html',
      },
    },
  },
});
