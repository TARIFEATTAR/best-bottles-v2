import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React - rarely changes
            'vendor-react': ['react', 'react-dom'],

            // Animation library
            'vendor-motion': ['framer-motion'],

            // AI/Voice SDKs - can be larger
            'vendor-ai': ['@google/genai', '@elevenlabs/react'],

            // Backend/Auth
            'vendor-supabase': ['@supabase/supabase-js'],

            // Icons
            'vendor-icons': ['lucide-react'],
          }
        }
      },
      // Increase warning limit slightly since we're now chunking properly
      chunkSizeWarningLimit: 600,
    }
  };
});

