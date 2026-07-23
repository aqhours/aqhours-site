export {};

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, string>) => void;
    };
  }
}
