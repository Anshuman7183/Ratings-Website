/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_BASE?: string;
  readonly VITE_DATA_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
