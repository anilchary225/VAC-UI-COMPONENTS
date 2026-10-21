import '@testing-library/jest-dom';

// Polyfill window.matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill window.fetch default mock
global.fetch = async (input: RequestInfo | URL) => {
  return {
    ok: true,
    json: async () => ({
      success: true,
      data: [],
    }),
  } as any;
};
