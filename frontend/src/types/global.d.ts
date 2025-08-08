export {};

declare global {
  interface Window {
    RUNTIME_CONFIG: {
      ENV: string;
      API_BASE_URL: string;
    };
  }
}

// Alternative: If you prefer a more flexible approach
// declare global {
//   interface Window {
//     ENV: Record<string, string>;
//   }
// }