let debugging = true;

if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
    debugging = window.RUNTIME_CONFIG.ENV === 'DEV';
  }

export const consoledebug: (...args: unknown[]) => void = debugging ? console.log.bind(console) : () => {};