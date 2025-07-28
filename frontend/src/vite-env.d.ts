/// <reference types="vite/client" />

// global.d.ts
export {};

declare global {
  interface Window {
    google: typeof google;
  }
}

