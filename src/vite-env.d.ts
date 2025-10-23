/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
