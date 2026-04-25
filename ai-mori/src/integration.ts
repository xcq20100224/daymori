import { createRoot } from 'react-dom/client';
import React from 'react';
import { MoriApp } from './MoriApp';

export const mountMoriToContainer = (container: HTMLElement): (() => void) => {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MoriApp />
    </React.StrictMode>
  );

  return () => {
    root.unmount();
  };
};
